import { users, projects, characters, plots, synopses, synopsisVersions, chapters, episodes, drafts, type User, type Project, type Character, type Plot, type Synopsis, type SynopsisVersion, type Chapter, type Episode, type Draft, type InsertUser, type InsertProject, type InsertCharacter, type InsertPlot, type InsertSynopsis, type InsertChapter, type InsertEpisode, type InsertDraft } from "@shared/schema";
import { db } from "./db.local";
import { eq, desc, max } from "drizzle-orm";

// ローカル環境用のSQLiteデータベースストレージ
export interface ILocalStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Character operations
  getCharacters(projectId: string): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, character: Partial<Character>): Promise<Character>;
  deleteCharacter(id: string): Promise<void>;

  // Plot operations
  getPlot(projectId: string): Promise<Plot | undefined>;
  createPlot(plot: InsertPlot): Promise<Plot>;
  updatePlot(id: string, plot: Partial<Plot>): Promise<Plot>;

  // Synopsis operations
  getSynopsis(projectId: string): Promise<Synopsis | undefined>;
  createSynopsis(synopsis: InsertSynopsis): Promise<Synopsis>;
  updateSynopsis(id: string, synopsis: Partial<Synopsis>): Promise<Synopsis>;
  getSynopsisVersions(projectId: string): Promise<SynopsisVersion[]>;
  createSynopsisVersion(version: { synopsisId: string; content: string; versionNumber: number }): Promise<SynopsisVersion>;

  // Chapter operations
  getChapters(projectId: string): Promise<Chapter[]>;
  getChapter(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<Chapter>): Promise<Chapter>;
  deleteChapter(id: string): Promise<void>;

  // Episode operations
  getEpisodes(chapterId: string): Promise<Episode[]>;
  getEpisode(id: string): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: string, episode: Partial<Episode>): Promise<Episode>;
  deleteEpisode(id: string): Promise<void>;

  // Draft operations
  getDrafts(episodeId: string): Promise<Draft[]>;
  createDraft(draft: InsertDraft): Promise<Draft>;
  updateDraft(id: string, draft: Partial<Draft>): Promise<Draft>;
  deleteDraft(id: string): Promise<void>;
}

export class LocalDatabaseStorage implements ILocalStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(desc(projects.createdAt));
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...projectData, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Character operations
  async getCharacters(projectId: string): Promise<Character[]> {
    return await db
      .select()
      .from(characters)
      .where(eq(characters.projectId, projectId))
      .orderBy(characters.order);
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character;
  }

  async createCharacter(characterData: InsertCharacter): Promise<Character> {
    const [character] = await db.insert(characters).values(characterData).returning();
    return character;
  }

  async updateCharacter(id: string, characterData: Partial<Character>): Promise<Character> {
    const [character] = await db
      .update(characters)
      .set({ ...characterData, updatedAt: new Date() })
      .where(eq(characters.id, id))
      .returning();
    return character;
  }

  async deleteCharacter(id: string): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }

  // Plot operations
  async getPlot(projectId: string): Promise<Plot | undefined> {
    const [plot] = await db.select().from(plots).where(eq(plots.projectId, projectId));
    return plot;
  }

  async createPlot(plotData: InsertPlot): Promise<Plot> {
    const [plot] = await db.insert(plots).values(plotData).returning();
    return plot;
  }

  async updatePlot(id: string, plotData: Partial<Plot>): Promise<Plot> {
    const [plot] = await db
      .update(plots)
      .set({ ...plotData, updatedAt: new Date() })
      .where(eq(plots.id, id))
      .returning();
    return plot;
  }

  // Synopsis operations
  async getSynopsis(projectId: string): Promise<Synopsis | undefined> {
    const [synopsis] = await db.select().from(synopses).where(eq(synopses.projectId, projectId));
    return synopsis;
  }

  async createSynopsis(synopsisData: InsertSynopsis): Promise<Synopsis> {
    const [synopsis] = await db.insert(synopses).values(synopsisData).returning();
    return synopsis;
  }

  async updateSynopsis(id: string, synopsisData: Partial<Synopsis>): Promise<Synopsis> {
    const [synopsis] = await db
      .update(synopses)
      .set({ ...synopsisData, updatedAt: new Date() })
      .where(eq(synopses.id, id))
      .returning();
    return synopsis;
  }

  async getSynopsisVersions(projectId: string): Promise<SynopsisVersion[]> {
    // First get the synopsis for this project
    const synopsis = await this.getSynopsis(projectId);
    if (!synopsis) return [];

    return await db
      .select()
      .from(synopsisVersions)
      .where(eq(synopsisVersions.synopsisId, synopsis.id))
      .orderBy(desc(synopsisVersions.versionNumber));
  }

  async createSynopsisVersion(versionData: { synopsisId: string; content: string; versionNumber: number }): Promise<SynopsisVersion> {
    const [version] = await db.insert(synopsisVersions).values(versionData).returning();
    return version;
  }

  // Chapter operations
  async getChapters(projectId: string): Promise<Chapter[]> {
    return await db
      .select()
      .from(chapters)
      .where(eq(chapters.projectId, projectId))
      .orderBy(chapters.order);
  }

  async getChapter(id: string): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async createChapter(chapterData: InsertChapter): Promise<Chapter> {
    const [chapter] = await db.insert(chapters).values(chapterData).returning();
    return chapter;
  }

  async updateChapter(id: string, chapterData: Partial<Chapter>): Promise<Chapter> {
    const [chapter] = await db
      .update(chapters)
      .set({ ...chapterData, updatedAt: new Date() })
      .where(eq(chapters.id, id))
      .returning();
    return chapter;
  }

  async deleteChapter(id: string): Promise<void> {
    await db.delete(chapters).where(eq(chapters.id, id));
  }

  // Episode operations
  async getEpisodes(chapterId: string): Promise<Episode[]> {
    return await db
      .select()
      .from(episodes)
      .where(eq(episodes.chapterId, chapterId))
      .orderBy(episodes.order);
  }

  async getEpisode(id: string): Promise<Episode | undefined> {
    const [episode] = await db.select().from(episodes).where(eq(episodes.id, id));
    return episode;
  }

  async createEpisode(episodeData: InsertEpisode): Promise<Episode> {
    const [episode] = await db.insert(episodes).values(episodeData).returning();
    return episode;
  }

  async updateEpisode(id: string, episodeData: Partial<Episode>): Promise<Episode> {
    const [episode] = await db
      .update(episodes)
      .set({ ...episodeData, updatedAt: new Date() })
      .where(eq(episodes.id, id))
      .returning();
    return episode;
  }

  async deleteEpisode(id: string): Promise<void> {
    await db.delete(episodes).where(eq(episodes.id, id));
  }

  // Draft operations
  async getDrafts(episodeId: string): Promise<Draft[]> {
    return await db
      .select()
      .from(drafts)
      .where(eq(drafts.episodeId, episodeId))
      .orderBy(desc(drafts.createdAt));
  }

  async createDraft(draftData: InsertDraft): Promise<Draft> {
    const [draft] = await db.insert(drafts).values(draftData).returning();
    return draft;
  }

  async updateDraft(id: string, draftData: Partial<Draft>): Promise<Draft> {
    const [draft] = await db
      .update(drafts)
      .set({ ...draftData, updatedAt: new Date() })
      .where(eq(drafts.id, id))
      .returning();
    return draft;
  }

  async deleteDraft(id: string): Promise<void> {
    await db.delete(drafts).where(eq(drafts.id, id));
  }
}

export const localStorage = new LocalDatabaseStorage();