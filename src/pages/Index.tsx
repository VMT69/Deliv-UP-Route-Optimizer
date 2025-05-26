import { useEffect } from "react";
import Delivery from "./Delivery";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LOCAL_KEY = "deliup_demo_user";

const Index = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem(LOCAL_KEY);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    localStorage.removeItem(LOCAL_KEY);
    navigate("/login");
  };

  // While redirecting, don't render anything
  if (!user) {
    return null;
  }

  return (
    <div>
      <div className="flex justify-end p-2">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <Delivery />
    </div>
  );
};

export default Index;

