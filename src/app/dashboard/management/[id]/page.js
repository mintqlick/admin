// or

import UsersPage from "@/components/user/main";

const DashboardPage = async ({ params }) => {
  // Access dynamic route parameter
  const { id } = await params;

  return (
    <div className="p-4">
      <UsersPage id={id} />
    </div>
  );
};

export default DashboardPage;
