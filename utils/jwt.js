import jwt from "jsonwebtoken";
const secret = process.env.JWT_SECRET;

export const setUser = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    secret,
    { expiresIn: "1h" }
  );
};

export const verifyUserToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error("Token verification failed!", error);
    return null;
  }
};
