import { nanoid } from 'nanoid';
import { ServerError } from '../errors';

const sessionStore: Record<string, { userId: string }> = { };

export function createNew(userId: string) {
  const sessionId = nanoid();

  sessionStore[sessionId] = { userId: userId };
  return sessionId;
}

export function returnInfo(sessionId?: string): { userId: string } {
  if (!sessionId) throw new ServerError('UNAUTHORISED', 'Session is empty');

  if (sessionId && sessionId in sessionStore) {
    return sessionStore[sessionId];
  } else {
    throw new ServerError('UNAUTHORISED', 'Session doesn\'t refer to any logged in user');
  }
}

export function remove(sessionId: string) {
  delete sessionStore[sessionId];
}

export function removeAllForUser(userId: string) {
  for (const sessionId in sessionStore) {
    if (sessionStore[sessionId].userId === userId) {
      delete sessionStore[sessionId];
    }
  }
}
