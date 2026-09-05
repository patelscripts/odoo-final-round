import ResourcePage from "../components/common/ResourcePage";
import { getSchedules, createSchedule, updateSchedule, deleteSchedule } from "../services/scheduleService";

const service = { list: getSchedules, create: createSchedule, update: updateSchedule, remove: deleteSchedule };

export default function Schedules() {
  return (
    <ResourcePage
      title="Schedules"
      description="Build working patterns and keep weekly hours visible."
      addLabel="Add schedule"
      service={service}
      transform={(data) => ({
        ...data,
        pattern: (data.pattern || []).filter((d) => d.startTime && d.endTime),
        totalWeeklyHours: data.totalWeeklyHours ? Number(data.totalWeeklyHours) : undefined,
      })}
      fields={[
        { key: "name", label: "Name", required: true },
        { key: "type", label: "Type", type: "select", options: ["full_time", "part_time", "shift"] },
        { key: "pattern", label: "Weekly pattern", type: "pattern", wide: true },
      ]}
      columns={[
        { key: "name", label: "Name" },
        { key: "type", label: "Type" },
        { key: "totalWeeklyHours", label: "Weekly hours" },
      ]}
    />
  );
}
