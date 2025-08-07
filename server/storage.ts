import { 
  type Project, type InsertProject,
  type Character, type InsertCharacter,
  type Plot, type InsertPlot,
  type Synopsis, type InsertSynopsis,
  type Chapter, type InsertChapter,
  type Episode, type InsertEpisode,
  type Draft, type InsertDraft,
  projects, characters, plots, synopses, chapters, episodes, drafts
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // Projects
  getProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project>;
  deleteProject(id: string): Promise<void>;

  // Characters
  getCharacters(projectId: string): Promise<Character[]>;
  getCharacter(id: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(id: string, character: Partial<Character>): Promise<Character>;
  deleteCharacter(id: string): Promise<void>;

  // Plots
  getPlot(projectId: string): Promise<Plot | undefined>;
  createPlot(plot: InsertPlot): Promise<Plot>;
  updatePlot(id: string, plot: Partial<Plot>): Promise<Plot>;

  // Synopses
  getSynopsis(projectId: string): Promise<Synopsis | undefined>;
  createSynopsis(synopsis: InsertSynopsis): Promise<Synopsis>;
  updateSynopsis(id: string, synopsis: Partial<Synopsis>): Promise<Synopsis>;

  // Chapters
  getChapters(projectId: string): Promise<Chapter[]>;
  getChapter(id: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: string, chapter: Partial<Chapter>): Promise<Chapter>;
  deleteChapter(id: string): Promise<void>;

  // Episodes
  getEpisodes(chapterId: string): Promise<Episode[]>;
  getEpisode(id: string): Promise<Episode | undefined>;
  createEpisode(episode: InsertEpisode): Promise<Episode>;
  updateEpisode(id: string, episode: Partial<Episode>): Promise<Episode>;
  deleteEpisode(id: string): Promise<void>;

  // Drafts
  getDrafts(episodeId: string): Promise<Draft[]>;
  getDraft(id: string): Promise<Draft | undefined>;
  createDraft(draft: InsertDraft): Promise<Draft>;
  updateDraft(id: string, draft: Partial<Draft>): Promise<Draft>;
  deleteDraft(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private projects: Map<string, Project>;
  private characters: Map<string, Character>;
  private plots: Map<string, Plot>;
  private synopses: Map<string, Synopsis>;
  private chapters: Map<string, Chapter>;
  private episodes: Map<string, Episode>;
  private drafts: Map<string, Draft>;

  constructor() {
    this.projects = new Map();
    this.characters = new Map();
    this.plots = new Map();
    this.synopses = new Map();
    this.chapters = new Map();
    this.episodes = new Map();
    this.drafts = new Map();
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values()).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const now = new Date();
    const project: Project = { 
      ...insertProject, 
      id, 
      description: insertProject.description ?? null,
      imageUrl: insertProject.imageUrl ?? null,
      currentStep: insertProject.currentStep ?? 1,
      progress: insertProject.progress ?? 0,
      createdAt: now,
      updatedAt: now
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const project = this.projects.get(id);
    if (!project) throw new Error("Project not found");
    
    const updated = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updated);
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    this.projects.delete(id);
    // Delete related data
    const charactersToDelete = Array.from(this.characters.entries())
      .filter(([_, char]) => char.projectId === id)
      .map(([charId]) => charId);
    charactersToDelete.forEach(id => this.characters.delete(id));

    const plotsToDelete = Array.from(this.plots.entries())
      .filter(([_, plot]) => plot.projectId === id)
      .map(([plotId]) => plotId);
    plotsToDelete.forEach(id => this.plots.delete(id));

    const synopsesToDelete = Array.from(this.synopses.entries())
      .filter(([_, syn]) => syn.projectId === id)
      .map(([synId]) => synId);
    synopsesToDelete.forEach(id => this.synopses.delete(id));

    const chaptersToDelete = Array.from(this.chapters.entries())
      .filter(([_, chap]) => chap.projectId === id)
      .map(([chapId]) => chapId);
    chaptersToDelete.forEach(id => this.chapters.delete(id));
  }

  // Characters
  async getCharacters(projectId: string): Promise<Character[]> {
    return Array.from(this.characters.values())
      .filter(c => c.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    return this.characters.get(id);
  }

  async createCharacter(insertCharacter: InsertCharacter): Promise<Character> {
    const id = randomUUID();
    const character: Character = { 
      ...insertCharacter, 
      id,
      role: insertCharacter.role ?? null,
      description: insertCharacter.description ?? null,
      imageUrl: insertCharacter.imageUrl ?? null,
      affiliation: insertCharacter.affiliation ?? null,
      personality: insertCharacter.personality ?? null,
      background: insertCharacter.background ?? null,
      order: insertCharacter.order ?? 0
    };
    this.characters.set(id, character);
    return character;
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const character = this.characters.get(id);
    if (!character) throw new Error("Character not found");
    
    const updated = { ...character, ...updates };
    this.characters.set(id, updated);
    return updated;
  }

  async deleteCharacter(id: string): Promise<void> {
    this.characters.delete(id);
  }

  // Plots
  async getPlot(projectId: string): Promise<Plot | undefined> {
    return Array.from(this.plots.values()).find(p => p.projectId === projectId);
  }

  async createPlot(insertPlot: InsertPlot): Promise<Plot> {
    const id = randomUUID();
    const plot: Plot = { 
      ...insertPlot, 
      id,
      theme: insertPlot.theme ?? null,
      setting: insertPlot.setting ?? null,
      structure: insertPlot.structure ?? "kishotenketsu",
      hook: insertPlot.hook ?? null,
      opening: insertPlot.opening ?? null,
      development: insertPlot.development ?? null,
      climax: insertPlot.climax ?? null,
      conclusion: insertPlot.conclusion ?? null
    };
    this.plots.set(id, plot);
    return plot;
  }

  async updatePlot(id: string, updates: Partial<Plot>): Promise<Plot> {
    const plot = this.plots.get(id);
    if (!plot) throw new Error("Plot not found");
    
    const updated = { ...plot, ...updates };
    this.plots.set(id, updated);
    return updated;
  }

  // Synopses
  async getSynopsis(projectId: string): Promise<Synopsis | undefined> {
    return Array.from(this.synopses.values()).find(s => s.projectId === projectId);
  }

  async createSynopsis(insertSynopsis: InsertSynopsis): Promise<Synopsis> {
    const id = randomUUID();
    const synopsis: Synopsis = { 
      ...insertSynopsis, 
      id,
      tone: insertSynopsis.tone ?? null,
      style: insertSynopsis.style ?? null
    };
    this.synopses.set(id, synopsis);
    return synopsis;
  }

  async updateSynopsis(id: string, updates: Partial<Synopsis>): Promise<Synopsis> {
    const synopsis = this.synopses.get(id);
    if (!synopsis) throw new Error("Synopsis not found");
    
    const updated = { ...synopsis, ...updates };
    this.synopses.set(id, updated);
    return updated;
  }

  // Chapters
  async getChapters(projectId: string): Promise<Chapter[]> {
    return Array.from(this.chapters.values())
      .filter(c => c.projectId === projectId)
      .sort((a, b) => a.order - b.order);
  }

  async getChapter(id: string): Promise<Chapter | undefined> {
    return this.chapters.get(id);
  }

  async createChapter(insertChapter: InsertChapter): Promise<Chapter> {
    const id = randomUUID();
    const chapter: Chapter = { 
      ...insertChapter, 
      id,
      summary: insertChapter.summary ?? null,
      estimatedWords: insertChapter.estimatedWords ?? null,
      estimatedReadingTime: insertChapter.estimatedReadingTime ?? null,
      characterIds: insertChapter.characterIds ?? []
    };
    this.chapters.set(id, chapter);
    return chapter;
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter> {
    const chapter = this.chapters.get(id);
    if (!chapter) throw new Error("Chapter not found");
    
    const updated = { ...chapter, ...updates };
    this.chapters.set(id, updated);
    return updated;
  }

  async deleteChapter(id: string): Promise<void> {
    this.chapters.delete(id);
    // Delete related episodes and drafts
    const episodesToDelete = Array.from(this.episodes.entries())
      .filter(([_, episode]) => episode.chapterId === id)
      .map(([epId]) => epId);
    
    episodesToDelete.forEach(epId => {
      this.episodes.delete(epId);
      const draftsToDelete = Array.from(this.drafts.entries())
        .filter(([_, draft]) => draft.episodeId === epId)
        .map(([draftId]) => draftId);
      draftsToDelete.forEach(draftId => this.drafts.delete(draftId));
    });
  }

  // Episodes
  async getEpisodes(chapterId: string): Promise<Episode[]> {
    return Array.from(this.episodes.values())
      .filter(e => e.chapterId === chapterId)
      .sort((a, b) => a.order - b.order);
  }

  async getEpisode(id: string): Promise<Episode | undefined> {
    return this.episodes.get(id);
  }

  async createEpisode(insertEpisode: InsertEpisode): Promise<Episode> {
    const id = randomUUID();
    const episode: Episode = { 
      ...insertEpisode, 
      id,
      description: insertEpisode.description ?? null,
      perspective: insertEpisode.perspective ?? null,
      mood: insertEpisode.mood ?? null,
      events: insertEpisode.events ?? [],
      dialogue: insertEpisode.dialogue ?? null,
      setting: insertEpisode.setting ?? null
    };
    this.episodes.set(id, episode);
    return episode;
  }

  async updateEpisode(id: string, updates: Partial<Episode>): Promise<Episode> {
    const episode = this.episodes.get(id);
    if (!episode) throw new Error("Episode not found");
    
    const updated = { ...episode, ...updates };
    this.episodes.set(id, updated);
    return updated;
  }

  async deleteEpisode(id: string): Promise<void> {
    this.episodes.delete(id);
    // Delete related drafts
    const draftsToDelete = Array.from(this.drafts.entries())
      .filter(([_, draft]) => draft.episodeId === id)
      .map(([draftId]) => draftId);
    draftsToDelete.forEach(draftId => this.drafts.delete(draftId));
  }

  // Drafts
  async getDrafts(episodeId: string): Promise<Draft[]> {
    return Array.from(this.drafts.values())
      .filter(d => d.episodeId === episodeId)
      .sort((a, b) => b.version - a.version);
  }

  async getDraft(id: string): Promise<Draft | undefined> {
    return this.drafts.get(id);
  }

  async createDraft(insertDraft: InsertDraft): Promise<Draft> {
    const id = randomUUID();
    const draft: Draft = { 
      ...insertDraft, 
      id,
      tone: insertDraft.tone ?? null,
      isGenerated: insertDraft.isGenerated ?? false,
      version: insertDraft.version ?? 1
    };
    this.drafts.set(id, draft);
    return draft;
  }

  async updateDraft(id: string, updates: Partial<Draft>): Promise<Draft> {
    const draft = this.drafts.get(id);
    if (!draft) throw new Error("Draft not found");
    
    const updated = { ...draft, ...updates };
    this.drafts.set(id, updated);
    return updated;
  }

  async deleteDraft(id: string): Promise<void> {
    this.drafts.delete(id);
  }
}

export class DatabaseStorage implements IStorage {
  // Projects
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const [updated] = await db.update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    if (!updated) throw new Error("Project not found");
    return updated;
  }

  async deleteProject(id: string): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Characters
  async getCharacters(projectId: string): Promise<Character[]> {
    return await db.select().from(characters).where(eq(characters.projectId, projectId));
  }

  async getCharacter(id: string): Promise<Character | undefined> {
    const [character] = await db.select().from(characters).where(eq(characters.id, id));
    return character;
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const [created] = await db.insert(characters).values(character).returning();
    return created;
  }

  async updateCharacter(id: string, updates: Partial<Character>): Promise<Character> {
    const [updated] = await db.update(characters)
      .set(updates)
      .where(eq(characters.id, id))
      .returning();
    if (!updated) throw new Error("Character not found");
    return updated;
  }

  async deleteCharacter(id: string): Promise<void> {
    await db.delete(characters).where(eq(characters.id, id));
  }

  // Plots
  async getPlot(projectId: string): Promise<Plot | undefined> {
    const [plot] = await db.select().from(plots).where(eq(plots.projectId, projectId));
    return plot;
  }

  async createPlot(plot: InsertPlot): Promise<Plot> {
    const [created] = await db.insert(plots).values(plot).returning();
    return created;
  }

  async updatePlot(id: string, updates: Partial<Plot>): Promise<Plot> {
    const [updated] = await db.update(plots)
      .set(updates)
      .where(eq(plots.id, id))
      .returning();
    if (!updated) throw new Error("Plot not found");
    return updated;
  }

  // Synopses
  async getSynopsis(projectId: string): Promise<Synopsis | undefined> {
    const [synopsis] = await db.select().from(synopses).where(eq(synopses.projectId, projectId));
    return synopsis;
  }

  async createSynopsis(synopsis: InsertSynopsis): Promise<Synopsis> {
    const [created] = await db.insert(synopses).values(synopsis).returning();
    return created;
  }

  async updateSynopsis(id: string, updates: Partial<Synopsis>): Promise<Synopsis> {
    const [updated] = await db.update(synopses)
      .set(updates)
      .where(eq(synopses.id, id))
      .returning();
    if (!updated) throw new Error("Synopsis not found");
    return updated;
  }

  // Chapters
  async getChapters(projectId: string): Promise<Chapter[]> {
    return await db.select().from(chapters).where(eq(chapters.projectId, projectId));
  }

  async getChapter(id: string): Promise<Chapter | undefined> {
    const [chapter] = await db.select().from(chapters).where(eq(chapters.id, id));
    return chapter;
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const [created] = await db.insert(chapters).values(chapter).returning();
    return created;
  }

  async updateChapter(id: string, updates: Partial<Chapter>): Promise<Chapter> {
    const [updated] = await db.update(chapters)
      .set(updates)
      .where(eq(chapters.id, id))
      .returning();
    if (!updated) throw new Error("Chapter not found");
    return updated;
  }

  async deleteChapter(id: string): Promise<void> {
    await db.delete(chapters).where(eq(chapters.id, id));
  }

  // Episodes
  async getEpisodes(chapterId: string): Promise<Episode[]> {
    return await db.select().from(episodes).where(eq(episodes.chapterId, chapterId));
  }

  async getEpisode(id: string): Promise<Episode | undefined> {
    const [episode] = await db.select().from(episodes).where(eq(episodes.id, id));
    return episode;
  }

  async createEpisode(episode: InsertEpisode): Promise<Episode> {
    const [created] = await db.insert(episodes).values(episode).returning();
    return created;
  }

  async updateEpisode(id: string, updates: Partial<Episode>): Promise<Episode> {
    const [updated] = await db.update(episodes)
      .set(updates)
      .where(eq(episodes.id, id))
      .returning();
    if (!updated) throw new Error("Episode not found");
    return updated;
  }

  async deleteEpisode(id: string): Promise<void> {
    await db.delete(episodes).where(eq(episodes.id, id));
  }

  // Drafts
  async getDrafts(episodeId: string): Promise<Draft[]> {
    return await db.select().from(drafts).where(eq(drafts.episodeId, episodeId));
  }

  async getDraft(id: string): Promise<Draft | undefined> {
    const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
    return draft;
  }

  async createDraft(draft: InsertDraft): Promise<Draft> {
    const [created] = await db.insert(drafts).values(draft).returning();
    return created;
  }

  async updateDraft(id: string, updates: Partial<Draft>): Promise<Draft> {
    const [updated] = await db.update(drafts)
      .set(updates)
      .where(eq(drafts.id, id))
      .returning();
    if (!updated) throw new Error("Draft not found");
    return updated;
  }

  async deleteDraft(id: string): Promise<void> {
    await db.delete(drafts).where(eq(drafts.id, id));
  }
}

// Use MemStorage for local development to avoid database connection issues
export const storage = process.env.VITE_LOCAL === "true" ? new MemStorage() : new DatabaseStorage();
