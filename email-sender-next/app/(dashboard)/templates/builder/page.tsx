
"use client";

import { useRef, useState, useEffect } from "react";
import EmailEditor, { EditorRef } from "react-email-editor";
import Button from "@/components/Button";
import { api } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

export default function EmailBuilder() {
    const emailEditorRef = useRef<EditorRef>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const templateId = searchParams.get("id");

    const [templateName, setTemplateName] = useState("New Template");
    const [subject, setSubject] = useState("New Subject");
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (templateId) {
            loadTemplate(templateId);
        }
    }, [templateId]);

    const loadTemplate = async (id: string) => {
        try {
            const t = await api(`/templates/${id}`);
            if (t) {
                setTemplateName(t.name);
                setSubject(t.subject);
                if (t.design && emailEditorRef.current) {
                    // Parse design if string
                    const design = typeof t.design === 'string' ? JSON.parse(t.design) : t.design;
                    emailEditorRef.current.editor?.loadDesign(design);
                    setIsLoaded(true);
                }
            }
        } catch (err) {
            console.error("Failed to load template", err);
        }
    };

    const exportHtml = () => {
        emailEditorRef.current?.editor?.exportHtml(async (data) => {
            const { design, html } = data;
            await saveTemplate(html, design);
        });
    };

    const saveTemplate = async (html: string, design: any) => {
        setLoading(true);
        try {
            const payload = {
                name: templateName,
                subject: subject,
                html: html,
                design: JSON.stringify(design),
                category: "newsletter",
            };

            if (templateId) {
                // Update
                await api(`/templates/${templateId}`, {
                    method: "PATCH", // Ensure PATCH route handles design update
                    body: payload,
                });
            } else {
                // Create
                await api("/templates", {
                    method: "POST",
                    body: payload,
                });
            }
            alert("Template Saved!");
            router.push("/templates");
        } catch (error) {
            console.error(error);
            alert("Failed to save template");
        } finally {
            setLoading(false);
        }
    };

    const onLoad = () => {
        // If we have a templateId but design wasn't loaded yet (because editor wasn't ready)
        // we might handle it here, but useEffect is usually fine if we wait for data.
        // Actually, loadDesign only works after onLoad.
        // So we should trigger load here if data is ready.
        if (templateId) {
            // Re-trigger load to ensure editor is ready
            loadTemplate(templateId);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)]">
            <div className="flex justify-between items-end mb-4 px-1 gap-4 bg-white p-4 rounded-xl border shadow-sm">
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Template Name</label>
                        <input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="w-full text-lg font-bold bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none py-1 transition"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Email Subject</label>
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full text-lg bg-transparent border-b border-gray-200 focus:border-indigo-500 outline-none py-1 transition"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        text="Cancel"
                        variant="secondary"
                        onClick={() => router.back()}
                    />
                    <Button
                        onClick={exportHtml}
                        text={loading ? "Saving..." : templateId ? "Update Template" : "Save New Template"}
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white shadow-inner relative">
                <EmailEditor
                    ref={emailEditorRef}
                    onLoad={onLoad}
                    style={{ height: '100%', minHeight: '600px' }}
                    options={{
                        appearance: {
                            theme: 'modern_light',
                            panels: {
                                tools: {
                                    dock: 'left'
                                }
                            }
                        }
                    }}
                />
            </div>
        </div>
    );
}
