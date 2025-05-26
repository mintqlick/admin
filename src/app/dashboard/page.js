import Box from "@/components/Box/Box";

const DashBoardPage = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="w-full flex justify-center">
        <Box className="flex bg-[#EDF2FC] flex-col justify-between">
          <span>Total Users Awaiting Matching</span>
          <span>900</span>
        </Box>
      </div>
    </div>
  );
};

export default DashBoardPage;
