import bcrypt from "bcrypt"

export function comparePassword(plain, hashed) {
    return bcrypt.compareSync(plain, hashed)
}