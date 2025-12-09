"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CREDIT_PACKAGES } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { initiatePayment } from "@/app/actions/payment-actions";
import { toast } from "sonner";
import { Loader2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function PurchaseCredits() {
  const [loading, setLoading] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
  });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
        setFormData({
          email: user.email || "",
          name: user.user_metadata?.full_name || user.user_metadata?.name || "",
          phone: "",
        });
      }
    });

    // Show success message if payment was successful
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "true") {
        toast.success("Payment completed successfully! Credits have been added to your account.");
        // Clean up URL
        window.history.replaceState({}, "", "/purchase");
      }
    }
  }, []);

  const handlePurchase = async (packageId: number) => {
    const pkg = CREDIT_PACKAGES[packageId];
    setSelectedPackage(packageId);
    setDialogOpen(true);
  };

  const handleConfirmPurchase = async () => {
    if (selectedPackage === null) return;

    const pkg = CREDIT_PACKAGES[selectedPackage!];
    setLoading(pkg.label);

    // Validate form data
    if (!formData.email || !formData.name || !formData.phone) {
      toast.error("Please fill in all required fields");
      setLoading(null);
      return;
    }

    // Validate phone number format (Tanzanian: 07XXXXXXXX)
    const phoneRegex = /^07\d{8}$/;
    const cleanedPhone = formData.phone.replace(/\s+/g, "");
    if (!phoneRegex.test(cleanedPhone)) {
      toast.error("Invalid phone number. Please use format: 07XXXXXXXX");
      setLoading(null);
      return;
    }

    try {
      const result = await initiatePayment({
        credits: pkg.credits,
        amount: pkg.price,
        buyerEmail: formData.email,
        buyerName: formData.name,
        buyerPhone: cleanedPhone,
      });

      if (result.success) {
        if (result.paymentUrl) {
          toast.success("Payment initiated successfully!");
          setDialogOpen(false);
          // Redirect to success page or refresh
          if (result.paymentUrl.includes("success=true")) {
            window.location.href = result.paymentUrl;
          } else {
            window.location.href = result.paymentUrl;
          }
        } else {
          toast.success("Payment initiated successfully!");
          setDialogOpen(false);
        }
      } else {
        toast.error(result.error || "Failed to initiate payment");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Purchase Credits</CardTitle>
          <CardDescription>
            Buy credits to use AI-powered assignment tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {CREDIT_PACKAGES.map((pkg, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl">{pkg.credits} Credits</CardTitle>
                  <CardDescription className="text-2xl font-bold text-primary">
                    {formatCurrency(pkg.price)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(index)}
                    disabled={loading !== null}
                  >
                    {loading === pkg.label ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Purchase"
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 rounded-md bg-blue-50 p-4">
            <h3 className="font-semibold mb-2">Payment Method</h3>
            <p className="text-sm text-gray-600">
              We accept mobile money payments via ZenoPay (supports M-Pesa, TigoPesa, and AirtelMoney). 
              After clicking &ldquo;Purchase&rdquo;, you&apos;ll be asked to confirm your details and complete the payment.
            </p>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment Details</DialogTitle>
            <DialogDescription>
              Please confirm your information to proceed with the payment via ZenoPay.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="John Doe"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="0744963858"
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: 07XXXXXXXX (Tanzanian mobile number)
              </p>
            </div>
            {selectedPackage !== null && (
              <div className="rounded-md bg-gray-50 p-3">
                <p className="text-sm font-medium">
                  Package: {CREDIT_PACKAGES[selectedPackage].credits} Credits
                </p>
                <p className="text-sm text-muted-foreground">
                  Amount: {formatCurrency(CREDIT_PACKAGES[selectedPackage].price)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={loading !== null}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase} disabled={loading !== null}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm & Pay"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

