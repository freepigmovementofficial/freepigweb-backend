import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/database";
import { jwtConfig } from "../../config/jwt";
import { generateOTP, getOTPExpiry } from "../../utils/otp";
import { sendOTPEmail } from "../../utils/email";

export const registerUser = async (
    name: string,
    email: string,
    password: string
) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("Email already registered");
    }

    // Hapus OTP lama kalau ada
    await prisma.otp.deleteMany({ where: { email } });

    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Simpan OTP + data user sementara (password di-hash dulu)
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.otp.create({
        data: {
            email,
            code: `${otp}|${name}|${hashedPassword}`, // simpan data sementara
            expiresAt,
        },
    });

    await sendOTPEmail(email, otp, name);

    return { message: "OTP sent to your email. Please verify to complete registration." };
};

export const verifyOTP = async (email: string, code: string) => {
    const otpRecord = await prisma.otp.findFirst({
        where: { email },
        orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
        throw new Error("OTP not found. Please register again.");
    }

    if (new Date() > otpRecord.expiresAt) {
        await prisma.otp.deleteMany({ where: { email } });
        throw new Error("OTP has expired. Please register again.");
    }

    const [storedOtp, name, hashedPassword] = otpRecord.code.split("|");

    if (storedOtp !== code) {
        throw new Error("Invalid OTP.");
    }

    // Buat user setelah OTP valid
    const user = await prisma.user.create({
        data: { name, email, password: hashedPassword },
        omit: { password: true },
    });

    // Hapus OTP setelah berhasil
    await prisma.otp.deleteMany({ where: { email } });

    const token = jwt.sign({ id: user.id }, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn as any,
    });

    return { user, token };
};

export const loginUser = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error("Invalid email or password");
    }

    const token = jwt.sign({ id: user.id }, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn as any,
    });

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
};

export const getMe = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        omit: { password: true },
    });

    if (!user) throw new Error("User not found");
    return user;
};