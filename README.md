# Essentico: Home Essentials E-Commerce UI/UX

## Midterm Case Study: CCS112 - Application Development and Emerging Technology

### Project Overview

**Essentico** is a home essentials e-commerce website developed as the Midterm Case Study for the CCS112 course. The primary objective is to **develop the front-end UI/UX** of the application using **React.js**.

This project emphasizes **effective team collaboration** using Git, demonstrated by creating individual branches, making commits, and submitting pull requests, as required by the activity.

---

### Technical Stack

| Category | Technology |
| :--- | :--- |
| **Frontend Framework** | React.js (Functional Components recommended) |
| **Routing** | React Router |
| **Styling** | **React-Bootstrap / Bootstrap CSS** (For responsive styling and components) |
| **Version Control** | Git & GitHub |
| **Environment** | Docker (as seen in development images) |

---

### Team Roles & Responsibilities

The team follows a component-based division of labor to ensure all key parts of the e-commerce UI are addressed.

| Member | Role / Focus Area | Main Responsibilities | Suggested Git Branch |
| :---: | :---: | :--- | :--- |
| **Stephanie Gapang** (stephvno07) | UI/UX Designer | Design wireframes, mockups, color scheme, typography, and layout. Prepare responsive layout guidelines and document design rationale. | `branch: uidesign` |
| **Primo Victor Miguel Llenasas** (MiguelLlenasas) | Home & Navigation Developer | Implement the Home Page (`HomePage.js`) and Navigation Bar (`Navbar.js`). Ensure navigation routes work (React Router) and apply design guidelines. | `branch: home-navbar` |
| **Arvy Lacampuenga** (Binosaur0107) | Product & Catalog Developer | Implement Product Listing (`ProductList.js`) and Product Details (`ProductDetails.js`) pages. Create reusable components (like `ProductCard`) and integrate sample product data (JSON). | `branch: product-pages` |
| **John Risk Labanda** (risktancinco) | Cart & Checkout Developer | Create Cart (`Cart.js`) and Checkout (`Checkout.js`) UI pages. Handle basic state updates (e.g., item count, total) and use React hooks for interactivity. | `branch: cart-checkout` |
| **Joshua Lopez** (pugarioo) | Style & Integration Manager | Unify CSS/Styling and ensure consistent look and responsiveness. **Merge all branches and resolve conflicts**. Deploy or run final testing. | `branch: integration-style` |

---

### Development Setup

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/pugarioo/Essentico.git](https://github.com/pugarioo/Essentico.git)
    cd Essentico
    ```
2.  **Install Dependencies (if running locally without Docker):**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Run with Docker Compose (Recommended):**
    ```bash
    docker compose up -d --build
    ```
    *The application should be accessible at **http://localhost:3000***.

> **Troubleshooting Note:** If you see an error like `Bind for 0.0.0.0:3000 failed: port is already allocated` (as shown in the provided development environment image), another program is using port 3000. You must either stop that program or change the port mapping (e.g., to `3001:3000`) in your `docker-compose.yml` file.

---

### Git Workflow Requirements

Active and proper Git collaboration is a core component of this activity.

1.  **Branching:** Each member must create and work on their **individual feature branch** (e.g., `git checkout -b home-navbar`).
2.  **Commits:** Make regular, descriptive commits to demonstrate contribution balance.
3.  **Pull Requests (PRs):** Submit a PR to the `main` branch upon feature completion.
4.  **Conflict Resolution:** The Style & Integration Manager (Joshua Lopez) is responsible for resolving conflicts during merges.