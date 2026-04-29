import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Product from "./pages/Product.tsx";
import Orders from "./pages/Orders.tsx";
import SellerDashboard from "./pages/SellerDashboard.tsx";
import SellerProof from "./pages/SellerProof.tsx";
import ConditionCapture from "./pages/ConditionCapture.tsx";
import DeliveryOtp from "./pages/DeliveryOtp.tsx";
import ReturnWindow from "./pages/ReturnWindow.tsx";
import ReturnCapture from "./pages/ReturnCapture.tsx";
import Processing from "./pages/Processing.tsx";
import Result from "./pages/Result.tsx";


import DigitalPassport from "./pages/DigitalPassport.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/seller" element={<SellerDashboard />} />
          <Route path="/seller/condition" element={<ConditionCapture />} />
          <Route path="/seller/proof" element={<SellerProof />} />
          <Route path="/delivery-otp" element={<DeliveryOtp />} />
          <Route path="/return-window" element={<ReturnWindow />} />
          <Route path="/return-capture" element={<ReturnCapture />} />
          <Route path="/processing" element={<Processing />} />
          <Route path="/result" element={<Result />} />
          <Route path="/passport/:orderId" element={<DigitalPassport />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
