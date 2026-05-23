"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { UtensilsCrossed, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function AuthPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer after OTP sent
  useEffect(() => {
    if (step !== "otp") return;
    setCountdown(30);
    setCanResend(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setStep("otp");
    toast.success("OTP sent to +91 " + phone);
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    // Auto-advance
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== 6) return;
    setIsLoading(true);
    // Simulate API call — any 6-digit code works
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);
    setAuth("mock-token", {
      id: "r1",
      name: "Paradise Biryani",
      phone,
      branchId: "b1",
    });
    toast.success("Welcome back!");
    router.push("/");
  };

  const handleResend = async () => {
    if (!canResend) return;
    setOtp(["", "", "", "", "", ""]);
    setStep("phone");
    await new Promise((r) => setTimeout(r, 100));
    setStep("otp");
  };

  const maskedPhone = phone.slice(0, 3) + "XXXXX" + phone.slice(-2);

  return (
    <AnimatePresence mode="wait">
      {step === "phone" ? (
        <motion.div
          key="phone"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -12 }}
          className="space-y-6"
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 shadow-[0_0_24px_rgba(252,95,48,0.2)]">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Restaurant Partner</h1>
            <p className="text-sm text-muted-foreground">Sign in to manage your restaurant</p>
          </motion.div>

          {/* Form */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile Number</Label>
              <div className="flex gap-2">
                <div className="flex h-10 items-center justify-center rounded-md border border-border bg-secondary px-3 text-sm text-muted-foreground shrink-0 select-none">
                  +91
                </div>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  onKeyDown={(e) => e.key === "Enter" && phone.length === 10 && handleSendOtp()}
                  autoFocus
                />
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={phone.length !== 10}
              loading={isLoading}
              onClick={handleSendOtp}
            >
              Send OTP
            </Button>
          </motion.div>

          <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service
          </motion.p>
        </motion.div>
      ) : (
        <motion.div
          key="otp"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -12 }}
          className="space-y-6"
        >
          {/* Back button */}
          <motion.button
            variants={itemVariants}
            onClick={() => { setStep("phone"); setOtp(["", "", "", "", "", ""]); }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </motion.button>

          {/* Logo */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/30 shadow-[0_0_24px_rgba(252,95,48,0.2)]">
              <UtensilsCrossed className="h-8 w-8 text-primary" />
            </div>
          </motion.div>

          {/* Heading */}
          <motion.div variants={itemVariants} className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Enter OTP</h1>
            <p className="text-sm text-muted-foreground">
              Sent to <span className="text-foreground font-medium">+91 {maskedPhone}</span>
            </p>
          </motion.div>

          {/* OTP Boxes */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div
              className="flex justify-center gap-2"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className={cn(
                    "h-12 w-10 text-center text-lg font-bold rounded-lg border",
                    "bg-secondary text-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
                    "transition-all duration-150",
                    digit ? "border-primary/50" : "border-border"
                  )}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={otp.join("").length !== 6}
              loading={isLoading}
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </Button>
          </motion.div>

          {/* Resend */}
          <motion.div variants={itemVariants} className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="flex items-center gap-1.5 mx-auto text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Resend OTP
              </button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Resend in{" "}
                <span className="text-foreground font-medium tabular-nums">
                  {countdown}s
                </span>
              </p>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
