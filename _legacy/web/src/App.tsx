import PlatformSearch from "./components/PlatformSearch";
import TenantLanding from "./components/TenantLanding";
import ApplyLanding from "./components/ApplyLanding";

function classifyHost(hostname: string) {
  const h = (hostname || "").toLowerCase().trim();

  // Apply domains: apply-ormonde.edapp.co.za
  if (h.startsWith("apply-")) return "apply";

  // Launcher domain (App Entry)
  if (h === "app.edapp.co.za" || h.startsWith("app.") || h === "ap.edapp.za" || h.startsWith("ap.")) return "platform"; // Shows PlatformSearch

  // Admin domain
  if (h === "admin.edapp.co.za" || h.startsWith("admin.")) return "admin";

  // Marketing domain (Static/External) - For now redirect or show platform if hitting app
  if (h === "edapp.co.za" || h === "www.edapp.co.za") {
    // In production, this should likely redirect to marketing site.
    // For this build, we treat it as platform/launcher if it hits the app.
    return "platform";
  }

  // Localhost (Dev Only)
  if (h === "localhost" || h === "127.0.0.1") return "tenant";

  // Everything else is a tenant domain
  return "tenant";
}

export default function App() {
  const hostname = window.location.hostname;
  const mode = classifyHost(hostname);

  const debugFooter = (
    <div className="fixed bottom-0 right-0 bg-black/80 text-white text-[10px] p-1 z-[9999] pointer-events-none opacity-50">
      DEBUG: {hostname} | {mode} | v2.3
    </div>
  );

  if (mode === "apply") return <>{debugFooter}<ApplyLanding /></>;
  if (mode === "platform") return <>{debugFooter}<PlatformSearch /></>;

  // Admin Mode: Re-use TenantLanding but we may need to pass a flag or handle it specificially.
  // Ideally 'TenantLanding' handles the login form. 
  // If we are at 'admin.edapp.co.za', we are effectively at the 'Main' tenant or a specific admin view.
  // For MVP Upgrade, we route admin to TenantLanding (Login) but it should probably default to 'Admin' role.
  if (mode === "admin") return <>{debugFooter}<TenantLanding /></>;

  return <>{debugFooter}<TenantLanding /></>;
}
