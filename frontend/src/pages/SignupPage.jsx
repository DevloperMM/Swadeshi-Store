import React, { useState } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, ArrowRight, Loader } from "lucide-react";
import { motion } from "framer-motion";
import InputField from "../components/InputField.jsx";
import { useUserStore } from "../store/useUserStore.js";

function SignupPage() {
  const { signup, loading } = useUserStore();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    signup(formData);
    setFormData({ ...formData, email: "", password: "", confirmPassword: "" });
  };

  const onNameChange = (e) =>
    setFormData({ ...formData, name: e.target.value });
  const onEmailChange = (e) =>
    setFormData({ ...formData, email: e.target.value });
  const onPassChange = (e) =>
    setFormData({ ...formData, password: e.target.value });
  const onConfirmPassChange = (e) =>
    setFormData({ ...formData, confirmPassword: e.target.value });

  return (
    <div className="flex flex-col justify-center py-4 sm:px-6 lg:px-8">
      <motion.div
        className="sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-emerald-400">
          Create your account
        </h2>
      </motion.div>

      <motion.div
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              id="name"
              name="Full Name"
              type="text"
              value={formData.name}
              onChange={onNameChange}
              placeholder="John Doe"
              icon={UserPlus}
            />

            <InputField
              id="email"
              name="Email Address"
              type="text"
              value={formData.email}
              onChange={onEmailChange}
              placeholder="you@example.com"
              icon={Mail}
            />

            <InputField
              id="newPass"
              name="New Password"
              type="password"
              value={formData.password}
              onChange={onPassChange}
              placeholder="••••••••"
              icon={Lock}
            />

            <InputField
              id="confirmPass"
              name="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={onConfirmPassChange}
              placeholder="••••••••"
              icon={Lock}
            />

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent 
							rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600
							 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2
							  focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader
                    className="mr-2 h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Loading...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" />
                  Sign up
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-emerald-400 hover:text-emerald-300"
            >
              Login here <ArrowRight className="inline h-4 w-4" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default SignupPage;
