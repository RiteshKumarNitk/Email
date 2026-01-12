import Button from "../components/Button";
import Input from "../components/Input";

export default function Compose() {
  return (
    <div className="max-w-4xl bg-white p-6 rounded shadow">
      <h1 className="text-xl font-semibold mb-6">Compose Email</h1>

      <div className="space-y-4">
        <Input label="To" placeholder="email1@gmail.com, email2@gmail.com" />
        <Input label="Subject" placeholder="Email subject" />

        <div>
          <label className="block text-sm font-medium mb-1">
            Email Body
          </label>
          <textarea
            className="w-full border rounded p-3 h-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Write your email here..."
          />
        </div>

        <div className="flex gap-3">
          <Button text="Send Now" />
          <Button text="Schedule" variant="secondary" />
        </div>
      </div>
    </div>
  );
}
