'use client';

import {
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Link,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function UblockClient() {
  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: 'bold', textAlign: 'center', color: 'white' }}
      >
        Comment installer uBlock Origin
      </Typography>

      <Typography variant="subtitle1" sx={{ mb: 4, textAlign: 'center', color: 'gray' }}>
        uBlock Origin vous aide à bloquer les publicités, améliorer la vitesse de navigation et
        protéger votre vie privée.
      </Typography>

      <Accordion defaultExpanded sx={{ backgroundColor: '#0f0e13', color: 'white' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography fontWeight="bold">🖥️ Ordinateur (PC / Mac)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography gutterBottom>
            1. Ouvrez votre navigateur :
          </Typography>
          <ul>
            <li>
              Chrome → <Link href="https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm" target="_blank">uBlock sur Chrome Web Store</Link>
            </li>
            <li>
              Firefox → <Link href="https://addons.mozilla.org/firefox/addon/ublock-origin/" target="_blank">uBlock sur Firefox Add-ons</Link>
            </li>
            <li>
              Edge → <Link href="https://microsoftedge.microsoft.com/addons/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm" target="_blank">uBlock sur Edge Add-ons</Link>
            </li>
          </ul>
          <Typography>
            2. Cliquez sur <strong>Ajouter à Chrome / Firefox / Edge</strong> et confirmez.
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ backgroundColor: '#0f0e13', color: 'white' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography fontWeight="bold">📱 iPhone / iPad (iOS)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography gutterBottom>
            Apple ne permet pas directement l'utilisation de uBlock Origin sur Safari mobile.
            Mais vous pouvez utiliser l'application <strong>AdGuard</strong> :
          </Typography>
          <ul>
            <li>
              Téléchargez <Link href="https://apps.apple.com/app/adguard/id1047223162" target="_blank">AdGuard sur l’App Store</Link>
            </li>
            <li>Suivez les instructions de configuration (Réglages → Safari → Extensions)</li>
            <li>Activez les filtres nécessaires dans l'app</li>
          </ul>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ backgroundColor: '#0f0e13', color: 'white' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}>
          <Typography fontWeight="bold">📱 Android</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography gutterBottom>
            Google ne permet pas d’ajouter uBlock Origin sur Chrome Android. Mais vous pouvez :
          </Typography>
          <ul>
            <li>
              Installer <Link href="https://www.mozilla.org/firefox/browsers/mobile/android/" target="_blank">Firefox pour Android</Link>
            </li>
            <li>
              Dans Firefox, allez dans le menu ≡ → Modules complémentaires → Rechercher "uBlock Origin"
            </li>
            <li>
              Installez et activez l’extension comme sur PC
            </li>
          </ul>
        </AccordionDetails>
      </Accordion>

      <Box mt={6} textAlign="center">
        <Typography variant="caption" color="gray">
          Guide mis à jour — {new Date().toLocaleDateString('fr-FR')}
        </Typography>
      </Box>
    </Container>
  );
}