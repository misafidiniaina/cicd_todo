import bcrypt from "bcryptjs";

export const hashPassword = (password) => bcrypt.hashSync(password, 10);
export const comparePassword = (plain, hashed) => bcrypt.compareSync(plain, hashed);
