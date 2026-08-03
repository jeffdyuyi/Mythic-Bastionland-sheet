import { useCharacterStore } from '../stores/useCharacterStore';
import { useGMStore } from '../stores/useGMStore';
import { useMapStore } from '../stores/useMapStore';

export interface CampaignArchiveData {
  version: number;
  exportedAt: string;
  charactersStore: {
    characterIds: string[];
    characters: ReturnType<typeof useCharacterStore.getState>['characters'];
    currentCharacterId: string | null;
  };
  gmStore: {
    activeMyths: ReturnType<typeof useGMStore.getState>['activeMyths'];
    activeMythIds: ReturnType<typeof useGMStore.getState>['activeMythIds'];
    npcs: ReturnType<typeof useGMStore.getState>['npcs'];
    combatRound: number;
  };
  mapStore: {
    width: number;
    height: number;
    hexSize: number;
    hexes: ReturnType<typeof useMapStore.getState>['hexes'];
    tokens: ReturnType<typeof useMapStore.getState>['tokens'];
  };
}

export function exportCampaignArchive(): void {
  const charState = useCharacterStore.getState();
  const gmState = useGMStore.getState();
  const mapState = useMapStore.getState();

  const archive: CampaignArchiveData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    charactersStore: {
      characterIds: charState.characterIds,
      characters: charState.characters,
      currentCharacterId: charState.currentCharacterId,
    },
    gmStore: {
      activeMyths: gmState.activeMyths,
      activeMythIds: gmState.activeMythIds,
      npcs: gmState.npcs,
      combatRound: gmState.combatRound,
    },
    mapStore: {
      width: mapState.width,
      height: mapState.height,
      hexSize: mapState.hexSize,
      hexes: mapState.hexes,
      tokens: mapState.tokens,
    },
  };

  const json = JSON.stringify(archive, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `mythic_bastionland_campaign_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importCampaignArchive(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as CampaignArchiveData;
    if (!data.charactersStore || !data.gmStore || !data.mapStore) {
      return false;
    }

    // 1. 恢复 CharacterStore
    useCharacterStore.setState({
      characterIds: data.charactersStore.characterIds || [],
      characters: data.charactersStore.characters || {},
      currentCharacterId: data.charactersStore.currentCharacterId || null,
      currentCharacter: data.charactersStore.currentCharacterId
        ? data.charactersStore.characters[data.charactersStore.currentCharacterId] || null
        : null,
    });

    // 2. 恢复 GMStore
    useGMStore.setState({
      activeMyths: data.gmStore.activeMyths || {},
      activeMythIds: data.gmStore.activeMythIds || [],
      npcs: data.gmStore.npcs || [],
      combatRound: data.gmStore.combatRound || 1,
    });

    // 3. 恢复 MapStore
    useMapStore.setState({
      width: data.mapStore.width || 12,
      height: data.mapStore.height || 10,
      hexSize: data.mapStore.hexSize || 42,
      hexes: data.mapStore.hexes || {},
      tokens: data.mapStore.tokens || [],
    });

    return true;
  } catch (err) {
    console.error('Failed to import campaign archive:', err);
    return false;
  }
}
