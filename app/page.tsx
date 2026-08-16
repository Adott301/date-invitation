"use client";

import React, { useState } from "react";

export default function DateInvitation() {
  const [submitted, setSubmitted] = useState(1);
  const [noButtonStyle, setNoButtonStyle] = useState<React.CSSProperties>({});

  // Form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [plan, setPlan] = useState("Đi ăn uống cà phê");
  const [foods, setFoods] = useState<string[]>([]);

  // Hiệu ứng nút "No" né chuột
  const moveNoButton = () => {
    const randomX = Math.floor(Math.random() * 250) - 125;
    const randomY = Math.floor(Math.random() * 250) - 125;
    setNoButtonStyle({
      transform: `translate(${randomX}px, ${randomY}px)`,
      transition: "all 0.2s ease",
    });
  };

  const toggleFood = (foodItem: string) => {
    if (foods.includes(foodItem)) {
      setFoods(foods.filter((f) => f !== foodItem));
    } else {
      setFoods([...foods, foodItem]);
    }
  };

  return (
    <main className="min-h-screen bg-pink-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center relative overflow-hidden border border-pink-100">

        {/* TRANG 1: Lời mời & Nút Yes/No */}
        {submitted === 1 && (
          <div>

            <h1 className="text-2xl font-bold text-pink-600 mb-6">
              Mai đi chơi với tui một bữa nha?
            </h1>
            <div className="flex justify-center gap-4 items-center h-24 relative">
              <button
                onClick={() => setSubmitted(2)}
                className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 rounded-full shadow-md transition transform hover:scale-105"
              >
                Sao lại không cơ chứ
              </button>
              <button
                onMouseEnter={moveNoButton}
                onClick={moveNoButton}
                style={noButtonStyle}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-full shadow-sm"
              >
                No 😢
              </button>
            </div>
          </div>
        )}

        {/* TRANG 2: Form lịch hẹn */}
        {submitted === 2 && (
          <div className="text-left space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-2">✨</div>
              <h2 className="text-xl font-bold text-pink-600">Lên lịch ngày mai nào!</h2>
            </div>

            {/* Chọn Ngày & Giờ */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date:</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Time:</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
              </div>
            </div>

            {/* Chọn Kế Hoạch */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">The Plan:</label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="Đi ăn uống cà phê">🍽️ Đi ăn uống cà phê</option>
                <option value="Đi xem phim">🎬 Đi xem phim</option>
                <option value="Đi dạo vi vu ngắm phố">🛵 Đi dạo vi vu ngắm phố</option>
              </select>
            </div>

            {/* Chỉ hiện mục chọn món ăn khi chọn "Đi ăn uống cà phê" */}
            {plan === "Đi ăn uống cà phê" && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">What should we eat?</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {["Lẩu / Nướng 🍲", "Món Hàn 🇰🇷", "Trà sữa & Bánh ngọt 🍰", "Pizza 🍕", "Jollibee 🍗", "Ramen 🍜"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleFood(item)}
                      className={`p-2 rounded-xl border text-xs font-medium transition ${foods.includes(item)
                        ? "bg-pink-500 text-white border-pink-500 shadow-md"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Nút Xác Nhận */}
            <button
              onClick={() => setSubmitted(3)}
              className="w-full mt-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-full shadow-md transition text-sm"
            >
              Confirm 🎉
            </button>
          </div>
        )}

        {/* TRANG 3: Xác nhận thành công */}
        {submitted === 3 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🥳</div>
            <h2 className="text-2xl font-bold text-pink-600 mb-2">Booking Successful!</h2>
            <p className="text-gray-600 mb-4 text-sm">Đây là thông tin đã chọn:</p>

            <div className="bg-pink-50 p-4 rounded-xl text-left space-y-2 mb-6 text-sm border border-pink-100">
              <p>📅 **Thời gian:** {date && time ? `${time} ngày ${date}` : "Chưa chọn cụ thể"}</p>
              <p>🎯 **Hoạt động:** {plan}</p>
              {plan === "Đi ăn uống cà phê" && (
                <p>🍽️ **Món ăn:** {foods.length > 0 ? foods.join(", ") : "Tùy bạn chọn sau nha!"}</p>
              )}
            </div>

            <button
              onClick={() => setSubmitted(1)}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 rounded-full shadow-md transition text-sm"
            >
              Làm lại từ đầu 💖
            </button>
          </div>
        )}

      </div>
    </main>
  );
}