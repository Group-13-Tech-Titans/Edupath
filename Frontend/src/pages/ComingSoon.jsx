
import { motion } from "framer-motion";

const ComingSoon = () => {
const handleBackClick = () => {
    window.history.back();
};

return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-100 via-teal-100 to-emerald-50 ">


        <main className="mx-auto flex max-w-6xl flex-1 items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="w-full max-w-xl rounded-[34px] border border-black/5 bg-white/70 p-8 text-center shadow-[0_18px_60px_rgba(0,0,0,0.10)] backdrop-blur"
            >
                <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 3.5, repeat: Infinity }}
                    className="mx-auto flex h-16 w-16 items-center justify-center rounded-[26px] bg-primary/15 text-3xl text-primary shadow-sm"
                >
                    🚧
                </motion.div>

                <h1 className="mt-5 text-3xl font-extrabold text-text-dark sm:text-4xl">
                    Coming Soon
                </h1>

                <p className="mx-auto mt-3 max-w-md text-sm text-muted">
                    This page is under development. We're building something modern and
                    smooth for EduPath.
                </p>

                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        onClick={handleBackClick}
                        className="rounded-full border border-black/10 bg-white/80 px-6 py-3 text-sm font-semibold text-text-dark hover:bg-white"
                    >
                        Back
                    </button>
                    
                </div>

                <p className="mt-6 text-xs text-muted">
                    © {new Date().getFullYear()} EduPath
                </p>
            </motion.div>
        </main>
    </div>
);
};

export default ComingSoon;
