export const translationResources = {
  en: (key: string, ...args: string[]) => {
    const translations: Record<string, string> = {
      'Hello there,': 'Hello there,',
      'you are invited to condominium': `you are invited to condominium ${args[0]} as a ${args[1]}.`,
      'Click the link below to accept the invitation.': 'Click the link below to accept the invitation.',
      'Accept Invitation': 'Accept Invitation',
      'Property Manager': 'Property Manager',
      Maintainer: 'Condominium Maintainer',
      'System Admin': 'Administrator of Flatmates System',
      'Thank you for choosing FlatMate! Almost there to complete registration':
        'Thank you for choosing FlatMate! Almost there to complete registration',
      'Click below and insert the code to verify your email.': 'Click below and insert the code to verify your email.',
      'Click here': 'Click here',
      'Email Verification': 'Email Verification',
      'User is registering. QR-Code is not available': 'User is registering. QR-Code is not available'
    };
    return translations[key] || key;
  },

  it: (key: string, ...args: string[]) => {
    const translations: Record<string, string> = {
      'You are invited to': `Sei stato invitato a ${args[0]}`,
      'Hello there,': 'Buongiorno!',
      'you are invited to condominium': `Sei stato invitato al condominio ${args[0]} come ${args[1]}.`,
      'Click the link below to accept the invitation.': "Clicca il link qui sotto per accettare l'invito.",
      'Accept Invitation': "Accetta l'invito",
      'Property Manager': 'Amministratore Condominiale',
      Maintainer: 'Manutentore condominiale',
      'System Admin': 'Amministratore di sistema Flatmates',
      'Thank you for choosing FlatMate! Almost there to complete registration':
        'Grazie per aver scelto FlatMate! Quasi pronto per completare la registrazione',
      'Click below and insert the code to verify your email.': 'Clicca qui sotto e inserisci il codice per verificare la tua email.',
      'Click here': 'Clicca qui',
      'Email Verification': 'Verifica Email',
      'User is registering. QR-Code is not available': "L'utente si sta registrando. Codice-QR non é disponibile."
    };
    return translations[key] || key;
  }
} as const;
