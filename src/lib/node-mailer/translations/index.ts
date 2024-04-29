export const translationResources = {
  en: (key: string, ...args: string[]) => {
    const translations: Record<string, string> = {
      'Hello there,': 'Hello there,',
      'you are invited to condominium': `you are invited to condominium ${args[0]} as a ${args[1]}.`,
      'Click the link below to accept the invitation.': 'Click the link below to accept the invitation.',
      'Accept Invitation': 'Accept Invitation',
      'Property Manager': 'Property Manager',
      Maintainer: 'Condominium Maintainer',
      'System Admin': 'Administrator of Flatmates System'
    };
    return translations[key];
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
      'System Admin': 'Amministratore di sistema Flatmates'
    };
    return translations[key];
  }
};
