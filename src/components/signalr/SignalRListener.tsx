import { connection } from "@/lib/signalr-client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AccountDeactivatedModal } from "../account-deactivated-modal";

let isConnected = false;

export default function SignalRListener() {
  const navigate = useNavigate();
  const [showDeactivatedModal, setShowDeactivatedModal] = useState(false);
  const handleAccountDeactivated = () => {
    // Clear session storage first
    localStorage.clear();
    // Set modal to false to close it
    setShowDeactivatedModal(false);
    // Then refresh the page
    window.location.reload();
  };

  useEffect(() => {
    if (!isConnected && connection.state === "Disconnected") {
      isConnected = true;
      connection
        .start()
        .then(() => console.log("✅ Connected to SignalR"))
        .catch((err) => {
          isConnected = false;
          console.error("❌ Connect fail:", err);
        });
    }

    connection.on("ReceiveNotification", (noti) => {
      console.log(noti);

      let navigatePath = "/";

      if (noti.title === "Sales") {
        navigatePath = "/sales/orders";
      } else if (noti.title === "Agency") {
        navigatePath = "/agency/orders";
      } else if (noti.title === "ReturnSales") {
        navigatePath = "/sales/review-order";
      } else if (noti.title === "ReturnAgency") {
        navigatePath = "/agency/return-order";
      } else if (noti.title === "Đơn hàng mới") {
        navigatePath = "/sales/export";
      }

      toast(noti.message, {
        action: {
          label: "Xem ngay",
          onClick: () => navigate(navigatePath),
        },
        className: "text-lg px-6 py-5 min-w-[380px]",
        style: {
          fontSize: "18px",
          borderRadius: "12px",
          minWidth: "380px",
        },
        duration: 6000,
      });
    });
    connection.on("UnActive", () => {
      setShowDeactivatedModal(true);
    });
    return () => {
      connection.off("ReceiveNotification");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AccountDeactivatedModal
      isOpen={showDeactivatedModal}
      onConfirm={handleAccountDeactivated}
    />
  );
}
