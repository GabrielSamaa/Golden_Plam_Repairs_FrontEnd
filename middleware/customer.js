export default function ({ redirect }) {
  if (process.client) {
    const role = localStorage.getItem('role')
    if (role !== '3') {
      return redirect('/login')
    }
  }
} 