import getConfig from "next/config";
import axios from "axios";
import { generateToken } from "utils/jwt-auth";

const { serverRuntimeConfig } = getConfig();
const config = serverRuntimeConfig;

export default async (req, res) => {
  const token = generateToken();
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email requerido" });
    }
    const { data } = await axios.get(`${config.url_api}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const userFound = data.find((u) => u.email === email);
    if (!userFound) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.status(200).json({ id: userFound._id });
  } catch (error) {
    console.error("ERROR::::", error);
    res.status(400).json(error?.response?.data || { message: "Error" });
  }
};
