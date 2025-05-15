import React from "react";
import { Link } from "react-router-dom";
import footballBg from "../assets/images/efootbalBG3.png";

function Register() {
    return (
        <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative">
            {/* Background Image */}
            <div
                className="fixed inset-0 -z-10"
                style={{
                    backgroundImage: `url(${footballBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    backgroundAttachment: "fixed"
                }}
            />

            {/* Header */}
            <header className="w-full flex justify-between items-center px-5 py-4 text-white fixed top-0 left-0 z-10 bg-black/60">
                <h2 className="text-2xl font-bold">PesScore</h2>
                <div>
                    <Link
                        to="/"
                        className="bg-white/20 hover:bg-white/40 text-white font-semibold px-4 py-2 rounded-full transition"
                    >
                        Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 mt-24 justify-center pb-32 px-1">
                <section className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-blue-700 mb-6">Register</h2>

                    <form className="flex flex-col gap-4 text-left">
                        <div>
                            <label htmlFor="name" className="block font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                placeholder="Enter your name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="account_name" className="block font-medium text-gray-700">Account Name</label>
                            <input
                                type="text"
                                id="account_name"
                                name="account_name"
                                placeholder="Enter account name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                placeholder="Enter your password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block font-medium text-gray-700">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="mt-2 bg-gradient-to-r from-blue-700 to-blue-500 text-white py-2 rounded-xl font-semibold hover:scale-105 transition"
                        >
                            Register
                        </button>
                    </form>

                    <p className="mt-6 text-gray-700">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-700 font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-gradient-to-r from-blue-800 to-blue-700 text-white w-full text-center py-4 mt-auto text-sm backdrop-blur-sm">
                PesScore © 2025 - Football Match Tracker
            </footer>
        </div>
    );
}

export default Register;