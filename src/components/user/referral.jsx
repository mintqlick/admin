"use client";

import React from "react";

const Referral = ({ referral }) => {
  if (!referral || !referral.user) {
    return <p className="text-red-600">Invalid referral data</p>;
  }

  const {
    referral_code,
    balance,
    created_at,
    user: { user_id, name },
  } = referral;

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 w-[45%]  border border-gray-200">
      <h2 className="text-xl font-semibold mb-3 text-gray-800">
        Referral Info
      </h2>

      <div className="space-y-2 text-sm text-gray-700">
        <p>
          <span className="font-medium">User ID:</span> NC-{user_id}
        </p>
        <p>
          <span className="font-medium">Name:</span> {name}
        </p>
        <p>
          <span className="font-medium">Referral Code:</span> {referral_code}
        </p>

        <p>
          <span className="font-medium">Created At:</span>{" "}
          {new Date(created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
};

export default Referral;
