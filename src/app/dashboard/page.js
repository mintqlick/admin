import Box from "@/components/Box/Box";
import StartingDashboard from "@/components/dashboard-home/starting";
import TransactionQue from "@/components/dashboard-home/transaction-que";
import UserSummary from "@/components/dashboard-home/user-summary";

const DashBoardPage = () => {
  return (
    <div className="w-full flex flex-col">
      <StartingDashboard />
      <TransactionQue />
      <UserSummary />
    </div>
  );
};

export default DashBoardPage;
