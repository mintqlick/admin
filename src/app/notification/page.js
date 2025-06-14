"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client"; // adjust path if different

const Notification = () => {
  const supabase = createClient();

  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch notifications from Supabase
  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) {
      setNotifications(data);
    } else {
      console.error("Error fetching notifications:", error.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setLoading(true);

    const { error } = await supabase
      .from("notifications")
      .insert([{ title, message }]);

    setLoading(false);
    if (error) {
      console.error("Error adding notification:", error.message);
    } else {
      setTitle("");
      setMessage("");
      fetchNotifications(); // refresh list
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    const { error } = await supabase.from("notifications").delete().eq("id", id);

    if (error) {
      console.error("Error deleting notification:", error.message);
    } else {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      {/* Title */}
      <h2 className="text-2xl font-semibold text-center">Send Notification</h2>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md"
      >
        <div>
          <label className="block font-medium text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
            placeholder="Notification title"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-gray-700">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
            rows={4}
            placeholder="Write your message here"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Notification"}
        </button>
      </form>

      {/* Notification List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Notifications</h3>
        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          notifications.map((item) => (
            <div
              key={item.id}
              className="bg-gray-100 p-4 rounded-md flex justify-between items-start"
            >
              <div>
                <h4 className="font-semibold text-gray-800">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 text-sm hover:underline ml-4"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notification;
