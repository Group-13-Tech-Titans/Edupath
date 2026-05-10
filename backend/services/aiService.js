exports.generatePathway = async ({ path, level }) => {

  // 🔥 TEMP (later connect Gemini)
  if (path === "Web Development") {
    return [
      {
        title: "Learn HTML",
        description: "Basics of HTML",
        type: "course",
        resource: "YouTube"
      },
      {
        title: "Learn CSS",
        description: "Styling",
        type: "course",
        resource: "YouTube"
      },
      {
        title: "Build Portfolio Website",
        description: "Project",
        type: "project"
      }
    ];
  }

  return [];
};