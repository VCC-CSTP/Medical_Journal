import React from 'react'
import { ChevronDownIcon } from '@heroicons/react/20/solid'

const people = [
  {
    name: "Lindsay Walton",
    title: "Front-end Developer",
    email: "lindsay.walton@example.com",
    role: "Member",
  },
  {
    name: "Courtney Henry",
    title: "Designer",
    email: "courtney.henry@example.com",
    role: "Admin",
  },
  {
    name: "Tom Cook",
    title: "Director of Product",
    email: "tom.cook@example.com",
    role: "Member",
  },
  {
    name: "Whitney Francis",
    title: "Copywriter",
    email: "whitney.francis@example.com",
    role: "Admin",
  },
  {
    name: "Leonard Krasner",
    title: "Senior Designer",
    email: "leonard.krasner@example.com",
    role: "Owner",
  },
  {
    name: "Floyd Miles",
    title: "Principal Designer",
    email: "floyd.miles@example.com",
    role: "Member",
  },
  {
    name: "Brooklyn Simmons",
    title: "UX Researcher",
    email: "brooklyn.simmons@example.com",
    role: "Member",
  },
  {
    name: "Devon Lane",
    title: "Backend Engineer",
    email: "devon.lane@example.com",
    role: "Admin",
  },
  {
    name: "Esther Howard",
    title: "Product Manager",
    email: "esther.howard@example.com",
    role: "Owner",
  },
  {
    name: "Guy Hawkins",
    title: "QA Engineer",
    email: "guy.hawkins@example.com",
    role: "Member",
  },
  {
    name: "Darlene Robertson",
    title: "Marketing Specialist",
    email: "darlene.robertson@example.com",
    role: "Admin",
  },
  {
    name: "Kathryn Murphy",
    title: "Full Stack Developer",
    email: "kathryn.murphy@example.com",
    role: "Member",
  },
  {
    name: "Albert Flores",
    title: "Data Analyst",
    email: "albert.flores@example.com",
    role: "Member",
  },
  {
    name: "Savannah Nguyen",
    title: "HR Coordinator",
    email: "savannah.nguyen@example.com",
    role: "Admin",
  },
  {
    name: "Jerome Bell",
    title: "UI Developer",
    email: "jerome.bell@example.com",
    role: "Member",
  },
  {
    name: "Cameron Williamson",
    title: "IT Manager",
    email: "cameron.williamson@example.com",
    role: "Owner",
  },
  {
    name: "Theresa Webb",
    title: "Project Coordinator",
    email: "theresa.webb@example.com",
    role: "Member",
  },
  {
    name: "Jenny Wilson",
    title: "Technical Writer",
    email: "jenny.wilson@example.com",
    role: "Admin",
  },
  {
    name: "Eleanor Pena",
    title: "DevOps Engineer",
    email: "eleanor.pena@example.com",
    role: "Member",
  },
  {
    name: "Jacob Jones",
    title: "Graphic Designer",
    email: "jacob.jones@example.com",
    role: "Member",
  },
  {
    name: "Ralph Edwards",
    title: "Support Specialist",
    email: "ralph.edwards@example.com",
    role: "Admin",
  },
  {
    name: "Kristin Watson",
    title: "Business Analyst",
    email: "kristin.watson@example.com",
    role: "Owner",
  },
  {
    name: "Wade Warren",
    title: "Solutions Architect",
    email: "wade.warren@example.com",
    role: "Member",
  },
  {
    name: "Leslie Alexander",
    title: "Security Engineer",
    email: "leslie.alexander@example.com",
    role: "Admin",
  },
  {
    name: "Annette Black",
    title: "Sales Executive",
    email: "annette.black@example.com",
    role: "Member",
  },
  {
    name: "Ronald Richards",
    title: "Finance Manager",
    email: "ronald.richards@example.com",
    role: "Owner",
  },
];

export const PeoplePage = () => {
  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold text-gray-900">Users</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the users in your account including their name, title,
            email and role.
          </p>
        </div>
        {/* <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Add user
          </button>
        </div> */}
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="relative min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pr-3 pl-4 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    <a href="#" className="group inline-flex">
                      Name
                      <span className="invisible ml-2 flex-none rounded-sm text-gray-400 group-hover:visible group-focus:visible">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="size-5"
                        />
                      </span>
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    <a href="#" className="group inline-flex">
                      Title
                      <span className="ml-2 flex-none rounded-sm bg-gray-100 text-gray-900 group-hover:bg-gray-200">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="size-5"
                        />
                      </span>
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    <a href="#" className="group inline-flex">
                      Email
                      <span className="invisible ml-2 flex-none rounded-sm text-gray-400 group-hover:visible group-focus:visible">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="invisible ml-2 size-5 flex-none rounded-sm text-gray-400 group-hover:visible group-focus:visible"
                        />
                      </span>
                    </a>
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    <a href="#" className="group inline-flex">
                      Role
                      <span className="invisible ml-2 flex-none rounded-sm text-gray-400 group-hover:visible group-focus:visible">
                        <ChevronDownIcon
                          aria-hidden="true"
                          className="invisible ml-2 size-5 flex-none rounded-sm text-gray-400 group-hover:visible group-focus:visible"
                        />
                      </span>
                    </a>
                  </th>
                  <th scope="col" className="py-3.5 pr-0 pl-3">
                    <span className="sr-only">View</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {people.map((person) => (
                  <tr key={person.email}>
                    <td className="py-4 pr-3 pl-4 text-sm font-medium whitespace-nowrap text-gray-900 sm:pl-0 text-left">
                      {person.name}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-left">
                      {person.title}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-left">
                      {person.email}
                    </td>
                    <td className="px-3 py-4 text-sm whitespace-nowrap text-gray-500 text-left">
                      {person.role}
                    </td>
                    <td className="py-4 pr-4 pl-3 text-right text-sm whitespace-nowrap sm:pr-0 text-left">
                      <a
                        href="#"
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View<span className="sr-only">, {person.name}</span>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
