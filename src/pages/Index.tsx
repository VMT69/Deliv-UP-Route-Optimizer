import Delivery from "./Delivery";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LOCAL_KEY = "deliup_demo_user";

const Index = () => {
  const navigate = useNavigate();

  // Show logout if logged in
  const user = localStorage.getItem(LOCAL_KEY);

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_KEY);
    navigate("/login");
  };

  if (!user) {
    // Not logged in, redirect to login page
    navigate("/login");
    return null;
  }

  return (
    <div>
      <div className="flex justify-end p-2">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      {/* Delivery page */}
      <Delivery />
    </div>
  );
};

export default Index;
