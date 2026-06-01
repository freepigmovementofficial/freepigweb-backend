export const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

export const getOTPExpiry = (): Date => {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10); // OTP valid 10 menit
    return expiry;
};