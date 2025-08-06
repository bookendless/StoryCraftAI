import type { Express } from "express";
import { localStorage } from "./storage.local";
import { 
  insertProjectSchema, insertCharacterSchema, insertPlotSchema, 
  insertSynopsisSchema, insertChapterSchema, insertEpisodeSchema, insertDraftSchema
} from "@shared/schema";
import { 
  completeCharacterWithOllama, 
  generatePlotWithOllama, 
  generateSynopsisWithOllama 
} from "./services/ollama";

// Helper function for error handling
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

export function registerLocalRoutes(app: Express) {
  // Projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await localStorage.getProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await localStorage.getProject(req.params.id);
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
      const projectData = insertProjectSchema.parse(req.body);
      const project = await localStorage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const project = await localStorage.updateProject(req.params.id, req.body);
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      await localStorage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Characters
  app.get("/api/projects/:projectId/characters", async (req, res) => {
    try {
      const characters = await localStorage.getCharacters(req.params.projectId);
      res.json(characters);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects/:projectId/characters", async (req, res) => {
    try {
      const characterData = insertCharacterSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const character = await localStorage.createCharacter(characterData);
      res.status(201).json(character);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/characters/:id", async (req, res) => {
    try {
      const character = await localStorage.updateCharacter(req.params.id, req.body);
      res.json(character);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/characters/:id", async (req, res) => {
    try {
      await localStorage.deleteCharacter(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Character completion with Ollama
  app.post("/api/characters/:characterId/complete", async (req, res) => {
    try {
      const character = await localStorage.getCharacter(req.params.characterId);
      if (!character) {
        return res.status(404).json({ message: "Character not found" });
      }

      const project = await localStorage.getProject(character.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const completion = await completeCharacterWithOllama(character, project);
      
      // 補完されたデータでキャラクターを更新
      const updatedCharacter = await localStorage.updateCharacter(req.params.characterId, completion);
      
      res.json(updatedCharacter);
    } catch (error) {
      console.error("Character completion error:", error);
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Plot
  app.get("/api/projects/:projectId/plot", async (req, res) => {
    try {
      const plot = await localStorage.getPlot(req.params.projectId);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects/:projectId/plot", async (req, res) => {
    try {
      const plotData = insertPlotSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const plot = await localStorage.createPlot(plotData);
      res.status(201).json(plot);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/plots/:id", async (req, res) => {
    try {
      const plot = await localStorage.updatePlot(req.params.id, req.body);
      res.json(plot);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Plot generation with Ollama
  app.post("/api/projects/:projectId/plot/generate", async (req, res) => {
    try {
      const project = await localStorage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const characters = await localStorage.getCharacters(req.params.projectId);

      const suggestion = await generatePlotWithOllama(
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
      const synopsis = await localStorage.getSynopsis(req.params.projectId);
      res.json(synopsis);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects/:projectId/synopsis", async (req, res) => {
    try {
      const synopsisData = insertSynopsisSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const synopsis = await localStorage.createSynopsis(synopsisData);
      res.status(201).json(synopsis);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/synopsis/:id", async (req, res) => {
    try {
      const synopsis = await localStorage.updateSynopsis(req.params.id, req.body);
      res.json(synopsis);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Synopsis generation with Ollama
  app.post("/api/projects/:projectId/synopsis/generate", async (req, res) => {
    try {
      const project = await localStorage.getProject(req.params.projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      const plot = await localStorage.getPlot(req.params.projectId);
      const characters = await localStorage.getCharacters(req.params.projectId);
      
      const content = await generateSynopsisWithOllama(
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
      const chapters = await localStorage.getChapters(req.params.projectId);
      res.json(chapters);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.get("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await localStorage.getChapter(req.params.id);
      if (!chapter) {
        return res.status(404).json({ message: "Chapter not found" });
      }
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/projects/:projectId/chapters", async (req, res) => {
    try {
      const chapterData = insertChapterSchema.parse({
        ...req.body,
        projectId: req.params.projectId
      });
      const chapter = await localStorage.createChapter(chapterData);
      res.status(201).json(chapter);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/chapters/:id", async (req, res) => {
    try {
      const chapter = await localStorage.updateChapter(req.params.id, req.body);
      res.json(chapter);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/chapters/:id", async (req, res) => {
    try {
      await localStorage.deleteChapter(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Episodes
  app.get("/api/chapters/:chapterId/episodes", async (req, res) => {
    try {
      const episodes = await localStorage.getEpisodes(req.params.chapterId);
      res.json(episodes);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.get("/api/episodes/:id", async (req, res) => {
    try {
      const episode = await localStorage.getEpisode(req.params.id);
      if (!episode) {
        return res.status(404).json({ message: "Episode not found" });
      }
      res.json(episode);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/chapters/:chapterId/episodes", async (req, res) => {
    try {
      const episodeData = insertEpisodeSchema.parse({
        ...req.body,
        chapterId: req.params.chapterId
      });
      const episode = await localStorage.createEpisode(episodeData);
      res.status(201).json(episode);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/episodes/:id", async (req, res) => {
    try {
      const episode = await localStorage.updateEpisode(req.params.id, req.body);
      res.json(episode);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/episodes/:id", async (req, res) => {
    try {
      await localStorage.deleteEpisode(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  // Drafts
  app.get("/api/episodes/:episodeId/drafts", async (req, res) => {
    try {
      const drafts = await localStorage.getDrafts(req.params.episodeId);
      res.json(drafts);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.post("/api/episodes/:episodeId/drafts", async (req, res) => {
    try {
      const draftData = insertDraftSchema.parse({
        ...req.body,
        episodeId: req.params.episodeId
      });
      const draft = await localStorage.createDraft(draftData);
      res.status(201).json(draft);
    } catch (error) {
      res.status(400).json({ message: getErrorMessage(error) });
    }
  });

  app.patch("/api/drafts/:id", async (req, res) => {
    try {
      const draft = await localStorage.updateDraft(req.params.id, req.body);
      res.json(draft);
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });

  app.delete("/api/drafts/:id", async (req, res) => {
    try {
      await localStorage.deleteDraft(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: getErrorMessage(error) });
    }
  });
}