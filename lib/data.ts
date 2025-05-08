// Sample data for the application

export type Employee = {
  id: string
  name: string
  position: string
  email: string
  phone: string
}

export type Product = {
  id: string
  name: string
  category: string
}

export type CompanyContact = {
  name: string
  email: string
  phone: string
}

export type Company = {
  id: string
  name: string
  address: string
  contact: CompanyContact
}

export type TaskStatus = "Complete" | "Pending" | "Working" | "Other"

export type Task = {
  id: string
  name: string
  details: string
  productId: string
  companyId: string
  date: string
  assignedById: string
  assignedToId: string
  status: TaskStatus
}

export type WorkDetail = {
  id: string
  taskId: string
  completionDate: string
  employeeId: string
  status: "Non-Issue" | "Issue" | "Complex" | "Smooth" | "Hard" | "Other"
  steps: string[]
}

// Sample data
export const employees: Employee[] = [
  {
    id: "emp1",
    name: "John Doe",
    position: "Software Developer",
    email: "john.doe@example.com",
    phone: "123-456-7890",
  },
  {
    id: "emp2",
    name: "Jane Smith",
    position: "Project Manager",
    email: "jane.smith@example.com",
    phone: "234-567-8901",
  },
  {
    id: "emp3",
    name: "Robert Johnson",
    position: "UI/UX Designer",
    email: "robert.johnson@example.com",
    phone: "345-678-9012",
  },
]

export const products: Product[] = [
  {
    id: "prod1",
    name: "Website Development",
    category: "Digital Services",
  },
  {
    id: "prod2",
    name: "Mobile App",
    category: "Software",
  },
  {
    id: "prod3",
    name: "SEO Package",
    category: "Marketing",
  },
]

export const companies: Company[] = [
  {
    id: "comp1",
    name: "Acme Corporation",
    address: "123 Main St, Anytown, USA",
    contact: {
      name: "Michael Brown",
      email: "michael.brown@acme.com",
      phone: "456-789-0123",
    },
  },
  {
    id: "comp2",
    name: "TechStart Inc.",
    address: "456 Tech Blvd, Innovation City, USA",
    contact: {
      name: "Sarah Williams",
      email: "sarah.williams@techstart.com",
      phone: "567-890-1234",
    },
  },
  {
    id: "comp3",
    name: "Global Enterprises",
    address: "789 Global Ave, Metropolis, USA",
    contact: {
      name: "David Miller",
      email: "david.miller@global.com",
      phone: "678-901-2345",
    },
  },
]

export const tasks: Task[] = [
  {
    id: "task1",
    name: "Website Redesign",
    details: "Redesign the company website with new branding",
    productId: "prod1",
    companyId: "comp1",
    date: "2023-05-15",
    assignedById: "emp2",
    assignedToId: "emp1",
    status: "Working",
  },
  {
    id: "task2",
    name: "Mobile App Development",
    details: "Develop a new mobile app for client",
    productId: "prod2",
    companyId: "comp2",
    date: "2023-06-01",
    assignedById: "emp2",
    assignedToId: "emp3",
    status: "Pending",
  },
  {
    id: "task3",
    name: "SEO Optimization",
    details: "Optimize website for search engines",
    productId: "prod3",
    companyId: "comp3",
    date: "2023-04-20",
    assignedById: "emp2",
    assignedToId: "emp1",
    status: "Complete",
  },
]

export const workDetails: WorkDetail[] = [
  {
    id: "wd1",
    taskId: "task3",
    completionDate: "2023-05-10",
    employeeId: "emp1",
    status: "Smooth",
    steps: [
      "Conducted keyword research",
      "Optimized meta tags and descriptions",
      "Improved site structure and navigation",
    ],
  },
]

// Helper functions to get related data
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getCompanyById(id: string): Company | undefined {
  return companies.find((company) => company.id === id)
}

export function getEmployeeById(id: string): Employee | undefined {
  return employees.find((employee) => employee.id === id)
}

export function getTaskById(id: string): Task | undefined {
  return tasks.find((task) => task.id === id)
}

export function getWorkDetailByTaskId(taskId: string): WorkDetail | undefined {
  return workDetails.find((workDetail) => workDetail.taskId === taskId)
}
