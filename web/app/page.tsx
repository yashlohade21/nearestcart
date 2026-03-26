export default function Home() {
  return (
    <div style={{ margin: 0, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", color: "#1a1a1a" }}>
      {/* Hero Section */}
      <section
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #065f46 0%, #10B981 100%)",
          color: "#fff",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <h1 style={{ fontSize: "3.5rem", fontWeight: 800, margin: 0 }}>NearKart</h1>
        <p style={{ fontSize: "1.35rem", marginTop: "1rem", opacity: 0.9, maxWidth: "600px" }}>
          Discover products at shops near you &mdash; in real time
        </p>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: "5rem 2rem",
          maxWidth: "960px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "3rem" }}>Why NearKart?</h2>
        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", justifyContent: "center" }}>
          {[
            {
              title: "Real-time Search",
              description: "Search products nearby and see what\u2019s available right now at local stores.",
              icon: "\uD83D\uDD0D",
            },
            {
              title: "Local Shops",
              description: "Support local retailers and discover shops in your neighbourhood.",
              icon: "\uD83C\uDFEA",
            },
            {
              title: "Smart Discovery",
              description: "Find the best deals and new arrivals at stores around you.",
              icon: "\u2728",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              style={{
                flex: "1 1 260px",
                maxWidth: "300px",
                background: "#f9fafb",
                borderRadius: "12px",
                padding: "2rem 1.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.6 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: "4rem 2rem",
          textAlign: "center",
          background: "#f0fdf4",
        }}
      >
        <h2 style={{ fontSize: "1.75rem", fontWeight: 700, marginBottom: "1rem" }}>
          Ready to shop smarter?
        </h2>
        <p style={{ fontSize: "1.05rem", color: "#555", marginBottom: "2rem" }}>
          Get NearKart and never miss a deal near you.
        </p>
        <button
          style={{
            background: "#10B981",
            color: "#fff",
            border: "none",
            padding: "0.85rem 2.5rem",
            fontSize: "1.1rem",
            fontWeight: 600,
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Download the App
        </button>
      </section>
    </div>
  );
}
