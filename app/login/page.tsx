"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const API_BASE =
process.env.NEXT_PUBLIC_API_URL ||
"https://novaprime-backend.vercel.app";

const handleLogin = async () => {
try {
const res = await axios.post(
`${API_BASE}/api/auth/login`,
{
email,
password,
}
);

  localStorage.setItem("token", res.data.token);

  router.push("/");
} catch (error) {
  alert("Invalid Email or Password");
}


};

return ( <div className="flex min-h-screen items-center justify-center bg-slate-100"> <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"> <h1 className="mb-6 text-center text-3xl font-bold">
NOVAPRIME CRM </h1>


    <input
      className="mb-4 w-full rounded-lg border p-3"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      className="mb-4 w-full rounded-lg border p-3"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      onClick={handleLogin}
      className="w-full rounded-lg bg-blue-600 p-3 text-white"
    >
      Login
    </button>
  </div>
</div>


);
}
