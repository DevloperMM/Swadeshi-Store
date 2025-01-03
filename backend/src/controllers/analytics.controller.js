import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { ApiError } from "../utils/ApiError.js";

export const getAnalytics = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    const salesData = await Order.aggregate([
      {
        $group: {
          _id: null, // it groups all documents together
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: "$orderTotal" },
        },
      },
    ]);

    const { totalSales, totalRevenue } = salesData[0] || {
      totalSales: 0,
      totalRevenue: 0,
    };

    return {
      totalUsers,
      totalProducts,
      totalSales,
      totalRevenue,
    };
  } catch (err) {
    throw new ApiError(
      500,
      err?.message || "Failed to fetch data analytics! Try again"
    );
  }
};

export const getDailySales = async (startDate, endDate) => {
  try {
    const dailySalesData = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: startDate,
            $lte: endDate,
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: 1 },
          revenue: { $sum: "$orderTotal" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // example of dailySalesData
    // [
    // 	{
    // 		_id: "2024-08-18",
    // 		sales: 12,
    // 		revenue: 1450.75
    // 	},
    // 	{
    // 		_id: "2024-08-19",
    // 		sales: 8,
    // 		revenue: 950.25
    // 	},
    // 	...
    // ]

    const dateArray = getDatesInRange(startDate, endDate);
    // console.log(dateArray) // ['2024-08-18', '2024-08-19', ... ]

    return dateArray.map((date) => {
      const foundData = dailySalesData.find((item) => item._id === date);

      return {
        date,
        sales: foundData?.sales || 0,
        revenue: foundData?.revenue || 0,
      };
    });
  } catch (err) {
    throw new ApiError(
      500,
      err?.message || "Failed to fetch daily sales! Try again"
    );
  }
};

function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
}
