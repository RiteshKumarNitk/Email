import { Injectable, BadRequestException } from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import * as bcrypt from "bcrypt"
import { UsersService } from "../users/users.service"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(name: string, email: string, password: string) {
    const exists = await this.usersService.findByEmail(email)
    if (exists) {
      throw new BadRequestException("Email already exists")
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await this.usersService.create({
      name,
      email,
      password: hash,
    })

    return this.signToken(user)
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) {
      throw new BadRequestException("Invalid credentials")
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      throw new BadRequestException("Invalid credentials")
    }

    return this.signToken(user)
  }

  // ✅ FULL USER OBJECT PASS KARO
  private signToken(user: any) {
    const payload = {
      sub: user._id.toString(),   // 🔥 MUST
      email: user.email,
    }

    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
