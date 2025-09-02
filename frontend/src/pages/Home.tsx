import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// Images moved to public folder for Vercel deployment
const img1 = "/img1.jpg";
const img2 = "/img2.jpg";
const bg = "/bgImg.jpg";
const logo = "/react.svg";

export default function Home() {
  const { user } = useAuth();
  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "Admin";

  const primaryCtaText = isAdmin ? "Create Class" : "Browse Classes";
  const secondaryCtaText = isAdmin ? "Create Session" : "Upcoming Sessions";

  const { heroImage, cards } = getRoleBasedContent(isAdmin, isLoggedIn);

  return (
    <div
      className="no-scroll-container"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        paddingTop: "72px",
      }}
    >
      {/* Hero */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
          alignItems: "center",
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "2rem 1rem",
          flex: "0 0 auto",
        }}
      >
        <div style={{ color: "#ecf0f1" }}>
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>
            {isAdmin
              ? "Manage Amazing Classes & Sessions"
              : "Discover and Book Amazing Classes"}
          </h1>
          <p style={{ opacity: 0.9, marginTop: "1rem", lineHeight: 1.6 }}>
            {isAdmin
              ? "Create classes, schedule sessions, and oversee bookings seamlessly from one place."
              : "From coding bootcamps to yoga flows, explore curated sessions designed to help you grow. Join live sessions, manage bookings, and track your journey — all in one place."}
          </p>
          <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
            <Link
              to="/classes"
              style={ctaStyle(isAdmin ? "#e74c3c" : "#e67e22")}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px) scale(1.03)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0) scale(1)")
              }
            >
              {primaryCtaText}
            </Link>
            <Link
              to="/sessions"
              style={ctaStyle("#3498db")}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(-2px) scale(1.03)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLAnchorElement).style.transform =
                  "translateY(0) scale(1)")
              }
            >
              {secondaryCtaText}
            </Link>
          </div>
        </div>
        <div>
          <img
            src={heroImage}
            alt="Featured visual"
            style={{
              width: "100%",
              height: "300px",
              objectFit: "cover",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
              transition: "transform 300ms ease, box-shadow 300ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform =
                "scale(1.03)";
              (e.currentTarget as HTMLImageElement).style.boxShadow =
                "0 14px 36px rgba(0,0,0,0.45)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLImageElement).style.transform =
                "scale(1)";
              (e.currentTarget as HTMLImageElement).style.boxShadow =
                "0 10px 30px rgba(0,0,0,0.35)";
            }}
          />
        </div>
      </section>

      {/* Highlights */}
      <section
        style={{
          background: "rgba(255,255,255,0.96)",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          flex: "1",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            padding: "1.5rem 1rem",
            height: "100%",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              margin: "0 0 1rem 0",
              color: "#2c3e50",
            }}
          >
            Why ClassBook?
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
              height: "calc(100% - 80px)",
            }}
          >
            {cards.map((card) => (
              <div
                key={card.title}
                style={{
                  ...cardStyle,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px) scale(1.02)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 10px 24px rgba(0,0,0,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0) scale(1)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 6px 18px rgba(0,0,0,0.08)";
                }}
              >
                <img
                  src={card.img}
                  alt={card.title}
                  style={{
                    width: "100%",
                    height: "120px",
                    objectFit: "cover",
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                    transition: "transform 300ms ease",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.transform =
                      "scale(1.05)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLImageElement).style.transform =
                      "scale(1)")
                  }
                />
                <div
                  style={{
                    padding: "1rem",
                    flex: "1",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "#2c3e50" }}>
                    {card.title}
                  </h3>
                  <p style={{ margin: 0, color: "#6c757d" }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Only show Get Started for visitors (not logged in) */}
          {!isLoggedIn && (
            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <Link
                to="/register"
                style={ctaStyle("#27ae60")}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.transform =
                    "translateY(-2px) scale(1.03)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLAnchorElement).style.transform =
                    "translateY(0) scale(1)")
                }
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  borderRadius: "12px",
  overflow: "hidden",
  background: "#fff",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  transition: "transform 250ms ease, box-shadow 250ms ease",
};

function getRoleBasedContent(isAdmin: boolean, isLoggedIn: boolean) {
  // Use all images from assets in varying combinations
  const images = [img1, img2, bg, logo];

  if (!isLoggedIn) {
    return {
      heroImage: images[0],
      cards: [
        {
          title: "Curated Classes",
          desc: "Hand-picked topics across tech, wellness, arts and more.",
          img: images[2],
        },
        {
          title: "Live Sessions",
          desc: "Join interactive sessions and learn with peers and mentors.",
          img: images[1],
        },
        {
          title: "Easy Bookings",
          desc: "Book, manage and cancel with friendly UI.",
          img: images[3],
        },
      ],
    };
  }

  if (isAdmin) {
    return {
      heroImage: images[1],
      cards: [
        {
          title: "Create Powerful Classes",
          desc: "Design and publish classes your learners will love.",
          img: images[3],
        },
        {
          title: "Schedule Sessions",
          desc: "Plan sessions with perfect capacity and time.",
          img: images[0],
        },
        {
          title: "Manage Bookings",
          desc: "View, audit and cancel bookings with one click.",
          img: images[2],
        },
      ],
    };
  }

  // Logged-in user
  return {
    heroImage: images[2],
    cards: [
      {
        title: "Curated Classes",
        desc: "Hand-picked topics across tech, wellness, arts and more.",
        img: images[0],
      },
      {
        title: "Live Sessions",
        desc: "Interactive learning with peers and mentors.",
        img: images[3],
      },
      {
        title: "Easy Bookings",
        desc: "Book, manage and cancel in a click.",
        img: images[1],
      },
    ],
  };
}

function ctaStyle(color: string): React.CSSProperties {
  return {
    display: "inline-block",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    color: "#fff",
    textDecoration: "none",
    background: color,
    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
    transition: "transform 200ms ease, background 200ms ease",
  };
}
