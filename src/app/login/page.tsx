"use client";

import { Button, Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Évite l'erreur d'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = () => {
    window.location.href = "/api/auth/login";
  };

  const handleSignUp = () => {
    window.location.href = "/api/auth/signup";
  };

  // Pendant l'hydratation, affiche un état de chargement simple
  if (!mounted) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={3}
      padding={2}
    >
      <Typography variant="h2" component="h1" gutterBottom textAlign="center">
        Welcome
      </Typography>

      <Typography variant="h6" color="text.secondary" textAlign="center" mb={3}>
        Please log in or create an account to continue
      </Typography>

      <Box
        display="flex"
        flexDirection="column"
        gap={2}
        width="100%"
        maxWidth="300px"
      >
        <Button
          variant="contained"
          color="primary"
          onClick={handleSignUp}
          size="large"
          fullWidth
        >
          CREATE ACCOUNT
        </Button>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleLogin}
          size="large"
          fullWidth
        >
          LOGIN
        </Button>
      </Box>
    </Box>
  );
}
