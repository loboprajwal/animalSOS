import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-100 border-t border-gray-200 py-6">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-primary mb-3">AnimalSOS</h3>
            <p className="text-sm text-gray-600">Connecting rescuers and animal welfare organizations across Maharashtra to help animals in need.</p>
          </div>
          <div>
            <h3 className="font-bold text-primary mb-3">Quick Links</h3>
            <ul className="text-sm space-y-2">
              <li>
                <Link href="/report-animal">
                  <a className="text-gray-600 hover:text-primary">Report an Animal</a>
                </Link>
              </li>
              <li>
                <Link href="/find-vets">
                  <a className="text-gray-600 hover:text-primary">Find Veterinarians</a>
                </Link>
              </li>
              <li>
                <Link href="/adoptions">
                  <a className="text-gray-600 hover:text-primary">Adoptable Animals</a>
                </Link>
              </li>
              <li>
                <Link href="/auth">
                  <a className="text-gray-600 hover:text-primary">Join as NGO</a>
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-primary mb-3">Contact Us</h3>
            <ul className="text-sm space-y-2">
              <li className="text-gray-600">Email: info@animalsos.org</li>
              <li className="text-gray-600">Emergency: +91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-500 mt-8">
          &copy; {new Date().getFullYear()} AnimalSOS. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
