import ProjectCard from "./ProjectCard"

export default function ProjectList() {
  const projects = [
    { id: 1, name: "Website Redesign", deadline: "2026-01-15" },
    { id: 2, name: "Mobile App", deadline: "2026-02-01" },
  ]

  return (
    <section>
      <h2>Projects</h2>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </section>
  )
}
