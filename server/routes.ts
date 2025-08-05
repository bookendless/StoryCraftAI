import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProjectSchema, insertCharacterSchema, insertPlotSchema, 
  insertSynopsisSchema, insertChapterSchema, insertEpisodeSchema, insertDraftSchema 
} from "@shared/schema";
import { 
  generateCharacterSuggestions, generatePlotSuggestion, generateSynopsis,
  generateChapterSuggestions, generateEpisodeSuggestion, generateDraft
} from "./services/openai";
import {
  generateCharacterSuggestionsWithGemini, generatePlotSuggestionWithGemini, generateSynopsisWithGemini,
  generateChapterSuggestionsWithGemini, generateEpisodeSuggestionWithGemini, generateDraftWithGemini
} from "./services/gemini";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

// Helper function for error handling
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.updateProject(req.params.id, req.body);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Characters
  app.get("/api/projects/:projectId/characters", async (req, res) => {
    try {
      const characters = await storage.getCharacters(req.params.projectId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects/:projectId/characters", async (req, res) => {
    try {
      const validatedData = insertCharacterSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const character = await storage.createCharacter(validatedData);
      res.status(201).json(character);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/characters/:id", async (req, res) => {
    try {
      const character = await storage.updateCharacter(req.params.id, req.body);
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      await storage.deleteCharacter(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // AI Character Generation
  app.post("/api/projects/:projectId/characters/generate", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const existingCharacters = await storage.getCharacters(req.params.projectId);
      const characterNames = existingCharacters.map(c => c.name);

      const suggestions = await generateCharacterSuggestionsWithGemini(
        project.title,
        project.genre,
        project.targetAudience || "一般読者",
        3
      );

      // Save generated characters to storage
      const savedCharacters = [];
      for (const suggestion of suggestions) {
        const characterData = {
          projectId: req.params.projectId,
          name: suggestion.name,
          description: suggestion.description,
          role: suggestion.role,
          personality: suggestion.personality,
          background: suggestion.background,
          motivation: suggestion.motivation,
          arc: suggestion.arc,
          affiliations: suggestion.affiliations || []
        };
        const savedCharacter = await storage.createCharacter(characterData);
        savedCharacters.push(savedCharacter);
      }

      res.json(savedCharacters);
    } catch (error) {
      console.error("Character generation error:", error);
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Plots
  app.get("/api/projects/:projectId/plot", async (req, res) => {
    try {
      const plot = await storage.getPlot(req.params.projectId);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects/:projectId/plot", async (req, res) => {
    try {
      const validatedData = insertPlotSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const plot = await storage.createPlot(validatedData);
      res.status(201).json(plot);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/plots/:id", async (req, res) => {
    try {
      const plot = await storage.updatePlot(req.params.id, req.body);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // AI Plot Generation
  app.post("/api/projects/:projectId/plot/generate", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const characters = await storage.getCharacters(req.params.projectId);
      const characterNames = characters.map(c => c.name);

      const suggestion = await generatePlotSuggestionWithGemini(
        project.title,
        project.genre,
        characters
      );

      res.json(suggestion);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Synopsis
  app.get("/api/projects/:projectId/synopsis", async (req, res) => {
    try {
      const synopsis = await storage.getSynopsis(req.params.projectId);
      res.json(synopsis);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects/:projectId/synopsis", async (req, res) => {
    try {
      const validatedData = insertSynopsisSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const synopsis = await storage.createSynopsis(validatedData);
      res.status(201).json(synopsis);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/synopsis/:id", async (req, res) => {
    try {
      const synopsis = await storage.updateSynopsis(req.params.id, req.body);
      res.json(synopsis);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // AI Synopsis Generation
  app.post("/api/projects/:projectId/synopsis/generate", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const plot = await storage.getPlot(req.params.projectId);
      const characters = await storage.getCharacters(req.params.projectId);
      
      const plotText = plot ? `${plot.theme} - ${plot.opening}` : "";
      const characterNames = characters.map(c => c.name);

      const content = await generateSynopsisWithGemini(
        project.title,
        plot,
        characters
      );

      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Chapters
  app.get("/api/projects/:projectId/chapters", async (req, res) => {
    try {
      const chapters = await storage.getChapters(req.params.projectId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects/:projectId/chapters", async (req, res) => {
    try {
      const validatedData = insertChapterSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const chapter = await storage.createChapter(validatedData);
      res.status(201).json(chapter);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await storage.updateChapter(req.params.id, req.body);
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      await storage.deleteChapter(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // AI Chapter Generation
  app.post("/api/projects/:projectId/chapters/generate", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const plot = await storage.getPlot(req.params.projectId);
      const existingChapters = await storage.getChapters(req.params.projectId);
      
      const plotText = plot ? `${plot.theme} - ${plot.opening} - ${plot.development}` : "";
      const chapterTitles = existingChapters.map(c => c.title);

      const synopsis = await storage.getSynopsis(req.params.projectId);
      const synopsisText = synopsis?.content || "";
      
      const suggestions = await generateChapterSuggestionsWithGemini(
        project.title,
        plot,
        synopsisText,
        10
      );

      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Episodes
  app.get("/api/chapters/:chapterId/episodes", async (req, res) => {
    try {
      const episodes = await storage.getEpisodes(req.params.chapterId);
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/chapters/:chapterId/episodes", async (req, res) => {
    try {
      const validatedData = insertEpisodeSchema.parse({
        ...req.body,
        chapterId: req.params.chapterId
      });
      const episode = await storage.createEpisode(validatedData);
      res.status(201).json(episode);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/episodes/:id", async (req, res) => {
    try {
      const episode = await storage.updateEpisode(req.params.id, req.body);
      res.json(episode);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/episodes/:id", async (req, res) => {
    try {
      await storage.deleteEpisode(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // AI Episode Generation
  app.post("/api/chapters/:chapterId/episodes/generate", async (req, res) => {
    try {
      const chapter = await storage.getChapter(req.params.chapterId);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }

      const characters = await storage.getCharacters(chapter.projectId);
      const characterNames = characters.map(c => c.name);

      const suggestions = await generateEpisodeSuggestionWithGemini(
        chapter.title,
        chapter.summary || "",
        characters
      );

      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Drafts
  app.get("/api/episodes/:episodeId/drafts", async (req, res) => {
    try {
      const drafts = await storage.getDrafts(req.params.episodeId);
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/episodes/:episodeId/drafts", async (req, res) => {
    try {
      const validatedData = insertDraftSchema.parse({
        ...req.body,
        episodeId: req.params.episodeId
      });
      const draft = await storage.createDraft(validatedData);
      res.status(201).json(draft);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/drafts/:id", async (req, res) => {
    try {
      const draft = await storage.updateDraft(req.params.id, req.body);
      res.json(draft);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // AI Draft Generation
  app.post("/api/episodes/:episodeId/drafts/generate", async (req, res) => {
    try {
      const episode = await storage.getEpisode(req.params.episodeId);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }

      const { tone = "バランスの取れた" } = req.body;

      const chapter = await storage.getChapter(episode.chapterId);
      const episodes = await storage.getEpisodes(episode.chapterId);
      const characters = await storage.getCharacters(chapter?.projectId || "");
      
      const content = await generateDraftWithGemini(
        chapter?.title || "章",
        episodes,
        characters,
        tone
      );

      res.json({ content });
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Object Storage routes
  const objectStorageService = new ObjectStorageService();

  // Public object serving
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Private object serving
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL
  app.post("/api/objects/upload", async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Set object ACL after upload
  app.post("/api/objects/acl", async (req, res) => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl) {
        return res.status(400).json({ error: "imageUrl is required" });
      }

      const objectPath = objectStorageService.normalizeObjectEntityPath(imageUrl);
      
      res.json({ objectPath });
    } catch (error) {
      console.error("Error setting object ACL:", error);
      res.status(500).json({ error: "Failed to set object ACL" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
