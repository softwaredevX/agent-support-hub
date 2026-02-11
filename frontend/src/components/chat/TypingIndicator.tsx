import { Box, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

export default function TypingIndicator() {
  const words = useMemo(
    () => ["Thinking", "Searching", "Drafting", "Checking", "Composing"],
    []
  );
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 900);
    return () => clearInterval(id);
  }, [words.length]);

  return (
    <Box px={2}>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {words[index]}...
      </Typography>
    </Box>
  );
}
