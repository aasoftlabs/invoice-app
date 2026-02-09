import Attendance from "@/models/Attendance";
import User from "@/models/User";

/**
 * Marks or updates attendance for a user on a specific date.
 * @param {string} userId - ID of the user
 * @param {Date} date - Date of the activity
 * @param {string} source - Source of the record ("self", "admin", "worklog")
 * @returns {Promise<Object>} The attendance record
 */
export async function markAttendance(userId, date, source = "self") {
  try {

    const activityTime = new Date(date);
    const activityDate = new Date(
      activityTime.getFullYear(),
      activityTime.getMonth(),
      activityTime.getDate(),
    );

    // Fetch user to check joining date
    const user = await User.findById(userId).select("joiningDate");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (activityDate > today) {
      throw new Error("Cannot mark attendance for future dates");
    }

    if (user?.joiningDate) {
      const joiningDate = new Date(user.joiningDate);
      joiningDate.setHours(0, 0, 0, 0);
      if (activityDate < joiningDate) {
        throw new Error(
          "Cannot mark attendance before joining date (" +
          joiningDate.toLocaleDateString() +
          ")",
        );
      }
    }


    // Check if attendance already exists for this day
    let attendance = await Attendance.findOne({
      userId,
      date: activityDate,
    });



    if (!attendance) {
      // First activity of the day: Clock In

      attendance = await Attendance.create({
        userId,
        date: activityDate,
        clockIn: activityTime,
        status: "present",
        source,
      });
    } else {
      // Update Clock Out if this activity is later than current clockIn

      if (!attendance.clockIn || activityTime < attendance.clockIn) {
        attendance.clockIn = activityTime;
      }

      if (!attendance.clockOut || activityTime > attendance.clockOut) {
        attendance.clockOut = activityTime;
      }

      attendance.status = "present";
      // Don't overwrite admin source with worklog or self
      if (attendance.source !== "admin") {
        attendance.source = source;
      }

      await attendance.save();
    }

    return attendance;
  } catch (error) {
    console.error("ERROR IN markAttendance UTILITY:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
}
