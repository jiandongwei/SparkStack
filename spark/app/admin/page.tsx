import Link from "next/link";

export default function AdminIndex() {
  return (
    <section>
      <p>Welcome to the Admin Console.</p>
      <ul>
        <li>
          <Link href="/admin/users">Manage Users</Link>
        </li>
        <li>
          <Link href="/admin/stats">View Stats (API)</Link>
        </li>
      </ul>
    </section>
  );
}
