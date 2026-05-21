import { subscribeToWalks } from '../services/walkService.js';
import { renderWalks } from '../modules/map/walksRenderer.js';
import { subscribeToAlerts } from '../services/alertsService.js';
import { renderAlerts } from '../modules/alerts/alertsRenderer.js';
import { loadPosts } from '../modules/posts/postsListeners.js';
import { loadInbox } from '../modules/chat/chatListeners.js';
import { appState as state } from './state.js';

export function setupSubscriptions() {
    state.activeListeners.walks = subscribeToWalks(walks => renderWalks(walks));
    state.activeListeners.alerts = subscribeToAlerts(alerts => renderAlerts(alerts));
    state.activeListeners.posts = loadPosts();
    state.activeListeners.inbox = loadInbox();
}
