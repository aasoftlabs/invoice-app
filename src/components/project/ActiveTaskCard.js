export default function ActiveTaskCard({ activeStats }) {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Current Project / Task
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p className="text-sm text-gray-600 mb-1">Project</p>
                    <p className="text-lg font-semibold text-blue-600">
                        {activeStats?.project || "-"}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-600 mb-1">Task</p>
                    <p className="text-lg font-semibold text-purple-600">
                        {activeStats?.task || "-"}
                    </p>
                </div>
            </div>
        </div>
    );
}
