"use client";

import { Dot } from "lucide-react";
import { useState } from "react";

const SenderItem = ({ item, onCheckboxChange, isChecked }) => {
  const [count, setCount] = useState(+item.amount_remaining);
  const [checked, setChecked] = useState(false);

  const AddCount = () => {
    const newValue = Math.min(
      parseFloat((count + 0.1).toFixed(1)),
      item.original_amount
    );
    setCount(newValue);
    onCheckboxChange(item.id, e.target.checked, newValue);
  };

  const reduceCount = () => {
    if (count <= 0.1) return;
    const newValue = parseFloat((count - 0.1).toFixed(1));
    setCount(newValue);
    onCheckboxChange(item.id, checked, newValue);
  };

  const handleCheckbox = (e) => {
    setChecked(e.target.checked);
    onCheckboxChange(item.id, e.target.checked, count);
  };

  const handleInputChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= item.original_amount) {
      setCount(parseFloat(value.toFixed(1)));
      onCheckboxChange(item.id, checked, value);
    }
  };

  return (
    <div className="w-full flex bg-white py-6 border-b-[#BAC3D3] border-b-2">
      <div className="w-5/12 flex justify-center items-center text-[#878E99] gap-2 px-5 text-[20px]">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleCheckbox}
          className="border-[#878E99] outline-[#878E99] outline-2 h-[20px] w-[20px] cursor-pointer"
        />
        {item?.id}
      </div>

      <div className="w-3/12 flex justify-center items-center text-[#878E99]">
        {item?.amount_remaining} USDT
      </div>

      <div className="w-2/12 flex gap-2 justify-center items-center">
        <span
          onClick={reduceCount}
          className="bg-[#EDF2FC] w-1/5 cursor-pointer text-[#1C1B1F] py-[0.5px] px-3 text-[25px] flex justify-center items-center"
        >
          -
        </span>

        <span className="bg-[#EDF2FC] w-2/6 border-[#1860D9] text-[#1860D9] border-2 py-[4px] px-3 text-[18px] flex justify-center items-center rounded-sm">
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            max={item?.amount_remaining}
            min={1}
            value={count}
            onChange={handleInputChange}
            className="w-full text-center appearance-none outline-none
              [&::-webkit-inner-spin-button]:appearance-none
              [&::-webkit-outer-spin-button]:appearance-none"
          />
        </span>

        <span
          onClick={AddCount}
          className="bg-[#EDF2FC] w-1/5 cursor-pointer text-[#1C1B1F] py-[0.5px] px-3 text-[25px] flex justify-center items-center"
        >
          +
        </span>
      </div>

      <div className="w-2/12 flex justify-center items-center">
        <span className="capitalize text-[#6E5801] rounded-2xl bg-[#FFF1BA] flex justify-start items-center w-[8rem] font-semibold text-[15px]">
          <Dot size={30} className="text-[#F7DC6F]" /> In Queue
        </span>
      </div>
    </div>
  );
};

export default SenderItem;
