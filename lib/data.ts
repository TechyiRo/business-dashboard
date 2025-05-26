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

// Updated work tags with new IT-focused tags
export const workTags = [
  { name: "Firewall", color: "bg-red-500 hover:bg-red-600", badge: "bg-red-100 text-red-800 hover:bg-red-200" },
  { name: "Switch", color: "bg-blue-500 hover:bg-blue-600", badge: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
  { name: "Server", color: "bg-green-500 hover:bg-green-600", badge: "bg-green-100 text-green-800 hover:bg-green-200" },
  {
    name: "Domain",
    color: "bg-purple-500 hover:bg-purple-600",
    badge: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  },
  {
    name: "ADDC",
    color: "bg-yellow-500 hover:bg-yellow-600",
    badge: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  },
  {
    name: "Wi-Fi",
    color: "bg-indigo-500 hover:bg-indigo-600",
    badge: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  },
  { name: "AP", color: "bg-pink-500 hover:bg-pink-600", badge: "bg-pink-100 text-pink-800 hover:bg-pink-200" },
  {
    name: "Networking Work",
    color: "bg-teal-500 hover:bg-teal-600",
    badge: "bg-teal-100 text-teal-800 hover:bg-teal-200",
  },
  {
    name: "Security",
    color: "bg-orange-500 hover:bg-orange-600",
    badge: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  },
  { name: "Visit", color: "bg-cyan-500 hover:bg-cyan-600", badge: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200" },
  { name: "Other", color: "bg-gray-500 hover:bg-gray-600", badge: "bg-gray-100 text-gray-800 hover:bg-gray-200" },
]

// Sample data
export const employees: Employee[] = [
  {
    id: "emp1",
    name: "Rohidas Shinde",
    position: "Network Administrator",
    email: "rohidas.shinde@example.com",
    phone: "123-456-7890",
  },
  {
    id: "emp2",
    name: "Priya Sharma",
    position: "System Administrator",
    email: "priya.sharma@example.com",
    phone: "234-567-8901",
  },
  {
    id: "emp3",
    name: "Amit Patil",
    position: "Security Specialist",
    email: "amit.patil@example.com",
    phone: "345-678-9012",
  },
]

export const products: Product[] = [
  {
    id: "prod1",
    name: "Network Infrastructure",
    category: "IT Services",
  },
  {
    id: "prod2",
    name: "Security Solutions",
    category: "Security",
  },
  {
    id: "prod3",
    name: "Server Management",
    category: "IT Services",
  },
]

export const companies: Company[] = [
  {
    id: "comp1",
    name: "TechCorp Solutions",
    address: "123 Tech Park, Mumbai, India",
    contact: {
      name: "Rajesh Kumar",
      email: "rajesh.kumar@techcorp.com",
      phone: "456-789-0123",
    },
  },
  {
    id: "comp2",
    name: "InfoSys Ltd",
    address: "456 Business District, Pune, India",
    contact: {
      name: "Sunita Desai",
      email: "sunita.desai@infosys.com",
      phone: "567-890-1234",
    },
  },
  {
    id: "comp3",
    name: "Digital Enterprises",
    address: "789 IT Hub, Bangalore, India",
    contact: {
      name: "Vikram Singh",
      email: "vikram.singh@digital.com",
      phone: "678-901-2345",
    },
  },
]

export const tasks: Task[] = [
  {
    id: "task1",
    name: "Firewall Configuration",
    details: "Configure firewall rules for new network segment",
    productId: "prod2",
    companyId: "comp1",
    date: "2023-05-15",
    assignedById: "emp2",
    assignedToId: "emp1",
    status: "Working",
  },
  {
    id: "task2",
    name: "Server Maintenance",
    details: "Perform routine maintenance on production servers",
    productId: "prod3",
    companyId: "comp2",
    date: "2023-06-01",
    assignedById: "emp2",
    assignedToId: "emp3",
    status: "Pending",
  },
  {
    id: "task3",
    name: "Network Security Audit",
    details: "Conduct comprehensive security audit of network infrastructure",
    productId: "prod2",
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
      "Conducted network vulnerability scan",
      "Reviewed firewall configurations",
      "Updated security policies and documentation",
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
