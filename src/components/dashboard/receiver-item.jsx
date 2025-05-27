"use client";

import { Dot } from "lucide-react";

const UserItem = ({ item, selected, onSelect }) => {
  return (
    <div className="w-full flex bg-[white] py-6 border-b-[#BAC3D3] border-b-2 justify-between">
      <div className="w-5/12 flex justify-center items-center text-[#878E99] gap-2 px-5 text-[20px]">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(item.id)}
          className="border-[#878E99] outline-[#878E99] outline-2 h-[20px] w-[20px] cursor-pointer"
        />
        {item?.id}
      </div>
      <div className="w-3/12 flex justify-center items-center text-[#878E99]">
        {item?.amount_remaining }
      </div>
      <div className="w-2/12 flex justify-center items-center">
        <span className="capitalize text-[#6E5801] rounded-2xl bg-[#FFF1BA] flex justify-start items-center w-[8rem] font-semibold text-[15px]">
          <Dot size={30} className="text-[#F7DC6F]" /> In Queue
        </span>
      </div>
    </div>
  );
};

export default UserItem;
